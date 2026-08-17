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

uniform float uRefraction;
uniform float uFrost;
uniform float uThickness;
uniform float uEdgeSoftness;
uniform float uFresnel;
uniform float uFresnelSoftness;
uniform vec3 uFresnelColor;
uniform vec3 uTintColor;
uniform float uTintIntensity;

//
//  SWGlassLogo.metal
//  ShipSwift
//
//  A stitchable SwiftUI `layerEffect` that turns an opaque silhouette (an SF
//  Symbol such as `apple.logo`) into a sheet of frosted, refractive glass that
//  exists ONLY inside the symbol's shape. Everything outside the silhouette is
//  cut away to full transparency, so the effect drops cleanly onto any dark
//  canvas as a glass-shaped logo.
//
//  Unlike the SDF-based glass in the library, this kernel has no analytic shape
//  to differentiate. The "shape" is whatever silhouette the source layer draws,
//  so the surface normal is recovered directly from the layer's ALPHA channel:
//  a finite-difference gradient of alpha points outward across the antialiased
//  contour and acts as the 2D surface normal. That single idea drives the whole
//  look:
//    - alpha gradient            -> 2D surface normal (refraction direction)
//    - distance-into-the-shape   -> edge-weighted refraction + frost falloff
//    - a small golden-angle disk -> frosted blur of the refracted content
//    - alpha-contour band        -> a cool Fresnel rim hugging the silhouette
//
//  The layer being sampled is the flowing color content placed BEHIND the
//  silhouette mask in Swift, so the glass refracts and frosts that moving light.
//
//  Paired with: SWGlassLogo.swift
//  Entry point: `swGlassLogo` — invoked via SwiftUI `.layerEffect(...)`.
//  Requires iOS 17+ / macOS 14+.
//





// =============================================================================
// MARK: - Local helpers
// =============================================================================



    // Rec. 601 luminance weights, used by the luminosity-preserving tint.
     const vec3 kLumWeights = vec3(0.299, 0.587, 0.114);

    /// Read the silhouette coverage at a pixel. The Swift side renders the mask
    /// shape into the alpha channel, so alpha is the cleanest coverage signal;
    /// we fall back to red only if a source happens to be fully opaque.
     float coverageAt(int layer, vec2 pos) {
        vec4 s = layerSample(pos);
        return float(s.a);
    }


// =============================================================================
// MARK: - swGlassLogo
// =============================================================================

/// A glass-logo refraction `layerEffect`.
///
/// - Parameter position: User-space pixel coordinate (auto-injected).
/// - Parameter layer: The SwiftUI layer being sampled — the flowing light
///   content, masked to the silhouette shape on the Swift side.
/// - Parameter boundingRect: The view's bounding rect; `.zw` is its size.
/// - Parameter refraction: Master strength of the refractive bend (subtle by
///   default — the look leans on frost + rim rather than heavy warp).
/// - Parameter frost: Frosted-blur disk radius in pixels-ish (0 = sharp).
/// - Parameter thickness: Apparent glass thickness; widens the band over which
///   the rim bends hardest before the centre goes calm.
/// - Parameter edgeSoftness: Width of the soft alpha-contour band the rim and
///   the composite cross-fade ride on.
/// - Parameter fresnel: Strength of the cool Fresnel rim hugging the contour.
/// - Parameter fresnelSoftness: How far in from the contour the rim reaches.
/// - Parameter fresnelColor: RGB of the cool rim light.
/// - Parameter tintColor: RGB the glass tints the refracted light toward.
/// - Parameter tintIntensity: How strongly the tint is mixed in (0 = none).
/// - Returns: The new pixel color, transparent outside the silhouette.

vec4 swGlassLogo(vec2 position, int layer, vec4 boundingRect, float refraction, float frost, float thickness, float edgeSoftness, float fresnel, float fresnelSoftness, vec3 fresnelColor, vec3 tintColor, float tintIntensity) {

    

    vec2 size = boundingRect.zw;

    // Coverage (silhouette alpha) at this pixel. Zero coverage = fully outside
    // the logo shape, so we cut straight to transparent and do no work.
    float cov = coverageAt(layer, position);
    if (cov <= 0.001) {
        return vec4(0.0);
    }

    // --- Surface normal from the ALPHA gradient -------------------------------
    // Sampling coverage one step away on each axis approximates ∂alpha/∂pos.
    // Across the antialiased silhouette edge alpha climbs from 0 (outside) to 1
    // (inside), so the gradient points INWARD; negating it gives an outward
    // surface normal just like an SDF gradient would, but recovered from the
    // rendered shape instead of an analytic formula.
    const float EPS = 1.5; // pixels — wide enough to span the AA edge
    float covX = coverageAt(layer, position + vec2(EPS, 0.0));
    float covY = coverageAt(layer, position + vec2(0.0, EPS));
    vec2 alphaGrad = vec2(covX - cov, covY - cov);
    float  gradLen   = length(alphaGrad);
    // Outward normal in screen space (zero in the flat interior where alpha is
    // , strong across the contour).
    vec2 normal = (gradLen > 1e-4) ? (-alphaGrad / gradLen) : vec2(0.0);

    // --- Edge band + thickness falloff ----------------------------------------
    // `edgeBand` is ~1 right on the antialiased contour and ~0 in the solid
    // interior — it is exactly where alpha is transitioning. We build it from
    // the gradient magnitude so it needs no distance field. The rim and the
    // refraction concentrate here; the calm interior is left mostly unbent,
    // matching how real glass bends light hardest at its curved edge.
    float band = clamp_01(gradLen * (32.0 / max(edgeSoftness, 0.001)));
    // Thickness widens the bend band a touch so thicker glass bends over a
    // broader lip; squared so the bend stays concentrated at the very edge.
    float thick = clamp_01(band * (0.5 + thickness));
    float bendStrength = thick * thick;

    // --- Refraction offset ----------------------------------------------------
    // Bend the sampled position along the outward normal, strongest at the edge.
    // Kept deliberately small: the brief calls for a subtle warp carried mostly
    // by frost and the cool rim, not a fisheye.
    vec2 refrOffset = normal * (refraction * 14.0) * bendStrength;
    vec2 lensPos = position + refrOffset;

    // --- Frosted blur (single golden-angle disk) ------------------------------
    // One small disk of taps frosts the refracted light. The disk grows a touch
    // toward the edge (more frost where the glass is "thicker" at the lip) and
    // stays calmer in the centre. All taps are weighted by their own coverage so
    // the blur never drags transparent exterior pixels into the silhouette.
    float diskRadius = frost * (0.6 + 0.8 * band);
    vec3 acc = vec3(0.0);
    float  wsum = 0.0;

    if (diskRadius > 0.25) {
        const int   TAPS = 9;
        const float GOLD = 2.39996323; // golden angle (radians)
        for (int i = 0; i < TAPS; i++) {
            float ang = float(i) * GOLD;
            float rad = sqrt(float(i) / float(TAPS));
            vec2 d  = vec2(cos(ang), sin(ang)) * rad * diskRadius;
            vec4  s  = layerSample(lensPos + d);
            float  wc = float(s.a);              // coverage weight: ignore exterior
            acc  += vec3(s.rgb) * wc;
            wsum += wc;
        }
    }
    vec3 refracted;
    if (wsum > 1e-4) {
        refracted = acc / wsum;
    } else {
        // No frost (or the disk fell entirely outside): single sharp tap.
        refracted = vec3(layerSample(lensPos).rgb);
    }

    // --- Tint -----------------------------------------------------------------
    // Nudge the refracted light toward the glass tint while preserving its
    // luminance, so the tint shifts hue/chroma without dimming the flow.
    vec3 tinted = mix(refracted, tintColor, tintIntensity);
    float origLum   = dot(refracted, kLumWeights);
    float tintedLum = dot(tinted,    kLumWeights);
    tinted *= origLum / max(tintedLum, 0.0001);

    // --- Cool Fresnel rim -----------------------------------------------------
    // A thin cool-blue lip riding the alpha contour. `rim` peaks on the edge
    // band and fades into the interior over `fresnelSoftness`, gated by coverage
    // so it never leaks past the silhouette. Squared for a crisp grazing falloff.
    float rimReach = max(fresnelSoftness, 0.05);
    float rim = band * smoothstep(0.0, rimReach, band);
    rim = rim * rim * fresnel;
    vec3 lit = tinted + fresnelColor * rim;

    // --- Composite ------------------------------------------------------------
    // Output alpha is the silhouette coverage, so the glass keeps the symbol's
    // exact shape with a soft antialiased edge and a fully transparent exterior.
    return vec4(vec3(lit * cov), float(cov));

}

void main() {
  vec2 position = vec2(gl_FragCoord.x, uSize.y - gl_FragCoord.y);
  fragColor = swGlassLogo(position, 0, vec4(0.0, 0.0, uSize.x, uSize.y), uRefraction, uFrost, uThickness, uEdgeSoftness, uFresnel, uFresnelSoftness, uFresnelColor, uTintColor, uTintIntensity);
}
