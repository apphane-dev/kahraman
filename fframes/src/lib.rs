//! Silent kahraman film. The brand outlines and colors come from ../brand.
mod kit;
mod scenes;
pub mod brand {
    include!(concat!(env!("OUT_DIR"), "/brand.rs"));
}

use fframes::{
    AudioMap, Duration, FFramesContext, Frame, Scene, Scenes, Svgr, Video, include_media_dir,
};

pub const WIDTH: usize = 1920;
pub const HEIGHT: usize = 1080;
pub const FPS: usize = 30;
pub use scenes::{DURATIONS, TITLES};
include_media_dir!(pub struct FilmMedia, "../brand/fonts");

#[derive(Debug)]
pub struct Shot(usize);
impl Scene for Shot {
    fn duration(&self) -> Duration<'_> {
        Duration::Seconds(DURATIONS[self.0])
    }
    fn name(&self) -> &'static str {
        TITLES[self.0]
    }
    fn render_frame<'a>(&'a self, frame: Frame, _ctx: &FFramesContext<'a, '_>) -> Svgr<'a> {
        scenes::render(self.0, frame.seconds())
    }
}

#[derive(Debug)]
pub struct KahramanFilm {
    shots: [Shot; 6],
}
impl Default for KahramanFilm {
    fn default() -> Self {
        Self {
            shots: std::array::from_fn(Shot),
        }
    }
}
impl Video for KahramanFilm {
    const FPS: usize = FPS;
    const WIDTH: usize = WIDTH;
    const HEIGHT: usize = HEIGHT;
    fn duration(&self) -> Duration<'_> {
        Duration::Auto
    }
    fn audio(&self) -> AudioMap<'_> {
        AudioMap::none()
    }
    fn define_scenes(&self) -> Scenes<'_> {
        Scenes::from(
            self.shots
                .iter()
                .map(|shot| shot as &dyn Scene)
                .collect::<Vec<_>>(),
        )
    }
    fn render_frame<'a>(&'a self, frame: Frame, ctx: &FFramesContext<'a, '_>) -> Svgr<'a> {
        fframes::svgr!(<svg xmlns="http://www.w3.org/2000/svg" width={WIDTH} height={HEIGHT}>
            {ctx.render_scenes(&frame)}
        </svg>)
    }
}
