use fframes::{EncoderOptions, RenderOptions, StaticMediaProvider, cli};
use fframes_skia_renderer::{
    SkiaFFramesRenderer, SkiaPipelineConcurrencyPolicy, SkiaPipelineConfig, vulkan::SkiaVulkanCtx,
};
use kahraman_film::{FilmMedia, HEIGHT, KahramanFilm, WIDTH};
use std::process::ExitCode;

fn run() -> Result<ExitCode, Box<dyn std::error::Error>> {
    let fonts = FilmMedia::prepare()?;
    let film = KahramanFilm::default();
    let gpu = SkiaVulkanCtx::new(WIDTH, HEIGHT)?;
    let backend = SkiaFFramesRenderer::new_vulkan(
        &gpu,
        SkiaPipelineConfig {
            concurrency_policy: SkiaPipelineConcurrencyPolicy::MaxPerformance,
            ..Default::default()
        },
    )?;
    Ok(cli::new(
        &film,
        RenderOptions {
            media: Some(&fonts),
            default_font: "Space Grotesk",
            video_encoder_options: EncoderOptions {
                preferred_encoder: Some("libx264"),
                codec_params: Some(&[("crf", "18"), ("preset", "medium"), ("tune", "animation")]),
                ..Default::default()
            },
            ..Default::default()
        },
    )
    .backend(backend)
    .preview(fframes_native_player::cli_preview)
    .default_output("deliverables/kahraman-silent.mp4")
    .run())
}
fn main() -> ExitCode {
    match run() {
        Ok(exit) => exit,
        Err(error) => {
            eprintln!("kahraman-film: {error}");
            ExitCode::FAILURE
        }
    }
}
