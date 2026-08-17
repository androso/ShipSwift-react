#version 300 es
precision highp float;
uniform vec2 uSize;
uniform float uTime;
uniform sampler2D uLayer;
out vec4 fragColor;

float clamp_01(float x) { return clamp(x, 0.0, 1.0); }
vec2 clamp_01(vec2 x) { return clamp(x, 0.0, 1.0); }
vec3 clamp_01(vec3 x) { return clamp(x, 0.0, 1.0); }
vec4 clamp_01(vec4 x) { return clamp(x, 0.0, 1.0); }

vec4 layerSample(vec2 p) {
  vec2 uv = vec2(p.x / max(uSize.x, 1.0), 1.0 - p.y / max(uSize.y, 1.0));
  return texture(uLayer, uv);
}

uniform float uShape;
uniform vec2 uCenter;
uniform float uScale;
uniform float uCornerRadius;
uniform float uCutout;
uniform float uRefraction;
uniform float uEdgeSoftness;
uniform float uBlur;
uniform float uThickness;
uniform float uAberration;
uniform float uInnerZoom;
uniform vec2 uLightDir;
uniform float uHighlight;
uniform vec3 uHighlightColor;
uniform float uHighlightSoftness;
uniform float uFresnel;
uniform float uFresnelSoftness;
uniform vec3 uFresnelColor;
uniform vec3 uTintColor;
uniform float uTintIntensity;
uniform float uTintPreserveLuminosity;

//
//  SWGlass.metal
//  ShipSwift
//
//  A stitchable SwiftUI `layerEffect` that turns any content into a sheet of
//  refractive glass laid over a region defined by an analytic signed-distance
//  field (SDF). The layer the effect is applied to is the *background* being
//  refracted; inside the SDF shape the background is bent, frosted, tinted and
//  lit, while outside the shape it passes through untouched (or is cut away
//  when `cutout` is on).
//
//  The glass is built entirely from the SDF and its gradient:
//    - The surface normal comes from a finite-difference gradient of the SDF.
//    - Thickness near the edge drives a squared refraction falloff so the rim
//      bends hard and the centre stays calm.
//    - A single in-shader golden-angle disk does the frosted blur, and the
//      same taps are reused with a chromatic split for dispersion.
//    - Tint, directional edge light, a 3D specular glint and a Fresnel rim are
//      layered on top, then cross-faded into the background by an edge mask.
//
//  This is a from-scratch Metal implementation of a well-known glass-refraction
//  recipe, reorganised into a single linear kernel with local helpers.
//
//  Paired with: SWGlass.swift
//  Entry point: `swGlass` — invoked via SwiftUI `.layerEffect(...)`.
//  Requires iOS 17+ / macOS 14+.
//





// =============================================================================
// MARK: - Local helpers
// =============================================================================



    // Luminance weights (Rec. 601) used by the luminosity-preserving tint.
     const vec3 kLumWeights = vec3(0.299, 0.587, 0.114);

    /// Signed distance to a circle of radius `r` centred at the origin.
    /// Negative inside, positive outside.
     float sdfCircle(vec2 p, float r) {
        return length(p) - r;
    }

    /// Signed distance to a rounded box with float-extents `b` and corner
    /// radius `r`, centred at the origin. Negative inside, positive outside.
     float sdfRoundedBox(vec2 p, vec2 b, float r) {
        vec2 q = abs(p) - b + r;
        return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
    }

    /// Evaluate the active shape's SDF at a *centred, aspect-corrected* point.
    /// `shape` 0 = circle, 1 = rounded rectangle (passed as a float since
    /// SwiftUI's `Shader.Argument` has no integer case). The shape is
    /// normalised to a nominal float-size of ~0.4 so the default 1.0 `scale`
    /// fills the view comfortably with margin for the rim.
     float sdfShape(vec2 p, float shape, float cornerRadius) {
        if (shape > 0.5) {
            // Rounded rectangle: slightly landscape float-extents read as a
            // "card / pill" of glass.
            return sdfRoundedBox(p, vec2(0.34, 0.26), cornerRadius);
        }
        // Default: circle.
        return sdfCircle(p, 0.4);
    }

    /// Map view UV (0...1) into the centred, aspect-corrected, scaled space the
    /// SDF lives in. Matches the inverse used when undoing the offset later.
     vec2 toShapeSpace(vec2 uv, vec2 center, vec2 aspect, float scale) {
        return (uv - center) * aspect / scale;
    }

    /// Sample the SDF for a given view UV, returning the distance already
    /// divided by `scale` so thresholds stay scale-independent.
     float sampleSDF(vec2 uv, vec2 center, vec2 aspect, float scale,
                           float shape, float cornerRadius) {
        vec2 p = toShapeSpace(uv, center, aspect, scale);
        return sdfShape(p, shape, cornerRadius) / scale;
    }


// =============================================================================
// MARK: - swGlass
// =============================================================================

/// A glass-refraction `layerEffect` over an analytic SDF region.
///
/// All geometry is computed in a normalised UV space (the view's bounding rect
/// maps to 0...1), aspect-corrected so circles stay round. The layer is the
/// background being refracted.
///
/// - Parameter position: User-space pixel coordinate (auto-injected).
/// - Parameter layer: The SwiftUI layer being sampled — the background.
/// - Parameter boundingRect: The view's bounding rect; `.zw` is its size.
/// - Parameter shape: 0 = circle, 1 = rounded rectangle.
/// - Parameter center: Shape centre in UV space (default 0.5, 0.5).
/// - Parameter scale: Shape scale; >1 shrinks the glass, <1 grows it.
/// - Parameter cornerRadius: Corner radius for the rounded-rectangle shape.
/// - Parameter cutout: When > 0.5, output alpha = the edge mask (glass is
///   isolated on transparency rather than composited over the background).
/// - Parameter refraction: Master strength of the refractive bend.
/// - Parameter edgeSoftness: Width of the soft edge fill band.
/// - Parameter blur: Frosted-glass disk radius in pixels-ish (0 = sharp).
/// - Parameter thickness: Apparent glass thickness; widens the refractive band.
/// - Parameter aberration: Chromatic split strength along the refraction vector.
/// - Parameter innerZoom: Magnifies the refracted content (>1 zooms in).
/// - Parameter lightDir: Pre-computed (cos, sin) of the light angle.
/// - Parameter highlight: Master strength of edge light + specular glint.
/// - Parameter highlightColor: RGB of the highlight / specular.
/// - Parameter highlightSoftness: Specular tightness (higher = broader glint).
/// - Parameter fresnel: Strength of the Fresnel rim.
/// - Parameter fresnelSoftness: Width of the Fresnel rim band.
/// - Parameter fresnelColor: RGB of the Fresnel rim.
/// - Parameter tintColor: RGB the glass tints the refracted content toward.
/// - Parameter tintIntensity: How strongly the tint is mixed in (0 = none).
/// - Parameter tintPreserveLuminosity: When > 0.5, the tint keeps original luma.
/// - Returns: The new pixel color.

vec4 swGlass(vec2 position, int layer, vec4 boundingRect, float shape, vec2 center, float scale, float cornerRadius, float cutout, float refraction, float edgeSoftness, float blur, float thickness, float aberration, float innerZoom, vec2 lightDir, float highlight, vec3 highlightColor, float highlightSoftness, float fresnel, float fresnelSoftness, vec3 fresnelColor, vec3 tintColor, float tintIntensity, float tintPreserveLuminosity) {

    

    vec2 size = boundingRect.zw;
    vec2 uv   = position / size;

    // Aspect correction: stretch the shorter axis so the SDF stays isotropic
    // (a circle reads as a circle on any view shape).
    float  ar     = size.x / max(size.y, 1.0);
    vec2 aspect = vec2(max(ar, 1.0), max(1.0 / ar, 1.0));

    // --- SDF at this pixel ----------------------------------------------------
    float sdf = sampleSDF(uv, center, aspect, scale, shape, cornerRadius);

    // Outside the shape: background passes straight through. With `cutout` the
    // exterior is fully transparent so only the glass remains.
    vec4 background = layerSample(position);
    if (sdf > 0.0) {
        if (cutout > 0.5) return vec4(0.0);
        return background;
    }

    // --- Surface normal via finite-difference SDF gradient --------------------
    // Sampling the SDF a small step away on each axis approximates ∂sdf/∂uv,
    // which points "outward" from the shape — our 2D surface normal.
    const float EPS = 0.01;
    float sdfX = sampleSDF(uv + vec2(EPS, 0.0), center, aspect, scale, shape, cornerRadius);
    float sdfY = sampleSDF(uv + vec2(0.0, EPS), center, aspect, scale, shape, cornerRadius);
    float gradX = (sdfX - sdf) / EPS;
    float gradY = (sdfY - sdf) / EPS;
    vec2 grad = vec2(gradX, gradY);

    // --- Edge fill mask (rb1) -------------------------------------------------
    // A 0...1 band that fills in from the silhouette over `sharp` units, used
    // both as the composite cross-fade and to gate the Fresnel rim.
    float sharp = max(edgeSoftness * 0.5, 0.001);
    float rb1   = clamp(-sdf / sharp * 32.0, 0.0, 1.0);

    // --- Thickness → refraction falloff --------------------------------------
    // Near the rim the glass is "thin" and bends hard; toward the centre it is
    // "thick" and calm. depthNorm is 0 at the rim → 1 once we pass the band,
    // and the squared inverse makes the bend concentrate at the edge.
    float thicknessRange = max(thickness * 0.3, 0.001);
    float depthNorm      = clamp(-sdf / thicknessRange, 0.0, 1.0);
    float refrStrength   = (1.0 - depthNorm) * (1.0 - depthNorm);

    // --- Refraction offset ----------------------------------------------------
    // Bend along the (negated) gradient, scaled by master refraction and the
    // edge-weighted strength. The x component is divided by aspect so the bend
    // is symmetric in screen space after the aspect stretch.
    vec2 offset = -grad * (refraction * 0.15) * refrStrength;
    offset.x /= aspect.x;

    // Magnify the refracted content about the centre, then add the bend.
    vec2 lensUV = center + (uv - center) / max(innerZoom, 0.0001) + offset;

    // --- Frosted blur + chromatic dispersion (single in-shader disk) ----------
    // One golden-angle disk does the frosting; the same disk is reused at three
    // chromatically-shifted centres for dispersion, so heavy taps only happen
    // when actually needed.
    vec2 pixelSize = 1.0 / size;
    float  diskRadius = blur * 2.0;                 // in pixels-ish
    bool   doBlur     = diskRadius > 0.001;
    vec2 chrOff     = offset * (aberration * 0.06);
    bool   doChroma   = aberration > 0.0001;

    const int   TAPS  = 9;
    const float GOLD  = 2.39996323; // golden angle (radians)

    vec3 rgb;
    if (!doBlur && !doChroma) {
        // Cheapest path: a single sharp tap at the bent UV.
        rgb = vec3(layerSample(lensUV * size).rgb);
    } else {
        // Accumulate r / g / b separately so we can offset the red and blue
        // sample centres for chromatic aberration while green stays put.
        float accR = 0.0, accG = 0.0, accB = 0.0;
        float wsum = 0.0;

        // When blur is off we still want a single tap per channel, so collapse
        // the disk to its centre by zeroing the radius.
        float effRadius = doBlur ? diskRadius : 0.0;
        int   effTaps   = doBlur ? TAPS : 1;

        vec2 cR = doChroma ? (lensUV + chrOff) : lensUV;
        vec2 cG = lensUV;
        vec2 cB = doChroma ? (lensUV - chrOff) : lensUV;

        for (int i = 0; i < effTaps; i++) {
            // Golden-angle spiral: uniform-ish disk coverage with few taps.
            float ang = float(i) * GOLD;
            float rad = sqrt(float(i) / float(TAPS));
            vec2 diskPt = vec2(cos(ang), sin(ang)) * rad;
            vec2 d = diskPt * pixelSize * effRadius;

            accR += layerSample((cR + d) * size).r;
            accG += layerSample((cG + d) * size).g;
            accB += layerSample((cB + d) * size).b;
            wsum += 1.0;
        }
        rgb = vec3(accR, accG, accB) / max(wsum, 1.0);
    }

    // --- Tint -----------------------------------------------------------------
    // Mix the refracted color toward the tint, optionally rescaling so the
    // tinted result keeps the original luminance (tint only shifts hue/chroma).
    vec3 tinted = mix(rgb, tintColor, tintIntensity);
    if (tintPreserveLuminosity > 0.5) {
        float origLum   = dot(rgb,    kLumWeights);
        float tintedLum = dot(tinted, kLumWeights);
        tinted *= origLum / max(tintedLum, 0.0001);
    }
    vec3 tintedGlass = tinted;

    // --- Directional edge light (rb2) ----------------------------------------
    // A bright ring just inside the silhouette, modulated by how much the
    // surface faces the light. `lightFacing` is the gradient dotted with the
    // light direction (the rim that points at the light glows).
    float rb2base    = clamp(-sdf / sharp, 0.0, 1.0);
    rb2base          = rb2base * (1.0 - rb2base) * 4.0; // ring: peaks mid-band
    float lightFacing = clamp(dot(normalize(grad + 1e-5), lightDir) * 0.5 + 0.5, 0.0, 1.0);
    float rb2          = rb2base * lightFacing * highlight;

    // --- Specular glint (3D float-vector) -------------------------------------
    // Treat the surface as a 3D normal tilted by the gradient, with the eye
    // straight on. The float-vector between light and eye drives a Blinn-Phong
    // lobe; the exponent comes from highlightSoftness (softer = lower power).
    vec3 N      = normalize(vec3(gradX, gradY, 2.0));
    vec3 L      = normalize(vec3(lightDir, 1.0));
    vec3 V      = vec3(0.0, 0.0, 1.0);
    vec3 H      = normalize(L + V);
    float  nDotH  = clamp(dot(N, H), 0.0, 1.0);
    float  specExp = exp2(8.0 - highlightSoftness * 7.0);
    float  specGlint = pow(nDotH, specExp) * highlight * refrStrength;

    // --- Fresnel rim ----------------------------------------------------------
    // A thin bright lip exactly at the silhouette, squared for a fast falloff
    // and gated by the edge fill mask so it never bleeds outside the glass.
    float fw         = max(fresnelSoftness * 0.06, 0.0001);
    float fEdge      = 1.0 - clamp(-sdf / fw, 0.0, 1.0);
    float fresnelRim = fEdge * fEdge * fresnel * rb1;

    // --- Composite ------------------------------------------------------------
    vec3 lighting = tintedGlass
                    + highlightColor * rb2
                    + highlightColor * specGlint
                    + fresnelColor   * fresnelRim;

    float transition = smoothstep(0.0, 1.0, rb1);
    vec3 outRGB    = mix(vec3(background.rgb), lighting, transition);

    float outA = (cutout > 0.5) ? float(transition) : background.a;
    return vec4(vec3(outRGB), outA);

}

void main() {
  vec2 position = vec2(gl_FragCoord.x, uSize.y - gl_FragCoord.y);
  fragColor = swGlass(position, 0, vec4(0.0, 0.0, uSize.x, uSize.y), uShape, uCenter, uScale, uCornerRadius, uCutout, uRefraction, uEdgeSoftness, uBlur, uThickness, uAberration, uInnerZoom, uLightDir, uHighlight, uHighlightColor, uHighlightSoftness, uFresnel, uFresnelSoftness, uFresnelColor, uTintColor, uTintIntensity, uTintPreserveLuminosity);
}
