use fframes::{
    CpuFrameRenderer, Previewer, RenderOptions, StaticMediaProvider, Video, diagnostics::Severity,
    snapshot,
};
use kahraman_film::{DURATIONS, FPS, FilmMedia, KahramanFilm, TITLES};

#[test]
fn timeline_is_32_seconds_with_six_unique_readable_scenes() {
    assert_eq!(DURATIONS.iter().sum::<f32>(), 32.0);
    assert!(DURATIONS.iter().all(|seconds| *seconds >= 5.0));
    let mut titles = TITLES.to_vec();
    titles.sort_unstable();
    titles.dedup();
    assert_eq!(titles.len(), DURATIONS.len());
}

#[test]
fn every_frame_is_warning_free() {
    let media = FilmMedia::prepare().unwrap();
    let film = KahramanFilm::default();
    let options = RenderOptions {
        media: Some(&media),
        default_font: "Space Grotesk",
        ..Default::default()
    };
    let mut previewer = Previewer::new(&film, &options).unwrap();
    assert_eq!(previewer.timeline().duration_in_frames, 32 * FPS);
    for frame in 0..32 * FPS {
        let report = previewer.inspect(frame).unwrap();
        let problems: Vec<_> = report
            .diagnostics
            .iter()
            .filter(|d| d.severity >= Severity::Warning)
            .map(|d| d.message.as_str())
            .collect();
        assert!(problems.is_empty(), "frame {frame}: {problems:?}");
    }
}

#[test]
fn film_is_silent_without_external_media() {
    let film = KahramanFilm::default();
    assert!(
        film.audio()
            .used_audio_files::<Vec<&str>>()
            .is_none_or(|files| files.is_empty())
    );
    let media = FilmMedia::prepare().unwrap();
    let options = RenderOptions {
        media: Some(&media),
        ..Default::default()
    };
    let previewer = Previewer::new(&film, &options).unwrap();
    assert!(previewer.timeline_report().audio.is_empty());
}

#[test]
fn settled_frames_match_reviewed_snapshots() {
    let media = FilmMedia::prepare().unwrap();
    let film = KahramanFilm::default();
    let options = RenderOptions {
        media: Some(&media),
        scale_resolution: 0.5,
        default_font: "Space Grotesk",
        ..Default::default()
    };
    let mut previewer = Previewer::new(&film, &options).unwrap();
    snapshot::assert_frames(
        &mut previewer,
        &mut CpuFrameRenderer::default(),
        &[
            "KahramanActor@2s",
            "KahramanLocate@4.5s",
            "KahramanRun@5s",
            "KahramanTrace@4s",
            "KahramanContext@4s",
            "KahramanOutro@3s",
        ],
        &snapshot::SnapshotOptions::default(),
    );
}
