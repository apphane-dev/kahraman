//! kahraman. "Test what users perceive". An actor that finds elements by role and name.
//!
//! Light paper, black ink, one cobalt accent; Swiss layout around a story canvas, its
//! accessibility tree and the actor's step trace. Space Grotesk for display, IBM Plex Mono for
//! code. Every code line and step label is the package's real API and label format.
//! Adapted from yonetmen commit d57f7ea. Identity now comes from ../brand.

use super::{brand::*, kit::*};
use fframes::Svgr;

pub const DURATIONS: [f32; 6] = [5.0, 6.0, 6.0, 5.0, 5.0, 5.0];
pub const TITLES: [&str; 6] = [
    "KahramanActor",
    "KahramanLocate",
    "KahramanRun",
    "KahramanTrace",
    "KahramanContext",
    "KahramanOutro",
];
/// Shot-relative visual event times; the animations use these same values.
pub const HITS: [&[f32]; 6] = [
    &[0.2, 1.2, 2.0, 2.8, 3.6],
    &[1.2, 2.2, 2.8, 4.0],
    &[0.4, 1.3, 2.2, 3.1, 4.0],
    &[0.4, 0.7, 1.0, 1.3, 1.8, 2.6],
    &[0.8, 1.4, 2.2],
    &[0.5],
];

const MONO_ADV: f32 = 0.6;

/// The README's sign-in test, line for line.
const TEST: [&str; 6] = [
    "I.init(context)",
    "await I.see(heading('Sign in'))",
    "await I.fill(role('textbox', 'Email'), 'ada@example.com')",
    "await I.click(button('Continue'))",
    "await I.waitExit(role('status'))",
    "await I.see(heading('Welcome, Ada'))",
];
/// The same calls as kahraman labels them in its step trace (`stepLabel` in src/steps.ts).
const TRACE: [&str; 5] = [
    "I.see(heading \"Sign in\")",
    "I.fill(textbox \"Email\", \"ada@example.com\")",
    "I.click(button \"Continue\")",
    "I.waitExit(status)",
    "I.see(heading \"Welcome, Ada\")",
];

pub fn render<'a>(shot: usize, t: f32) -> Svgr<'a> {
    let dur = DURATIONS.get(shot).copied().unwrap_or(5.0);
    let body = match shot {
        0 => actor(t),
        1 => locate(t),
        2 => run(t),
        3 => trace(t),
        4 => context(t),
        _ => outro(t),
    };
    let fade = if shot >= 5 { 1.0 } else { tail(t, dur) };
    fframes::svgr!(<g>
        <rect x="0" y="0" width="1920" height="1080" fill={PAPER} />
        <g opacity={fade}>{body}</g>
        {chrome(shot, t)}
    </g>)
}

fn hit(shot: usize, i: usize) -> f32 {
    HITS[shot].get(i).copied().unwrap_or(0.0)
}

/// Persistent header and a six-segment progress rail.
fn chrome<'a>(shot: usize, t: f32) -> Svgr<'a> {
    let total: f32 = DURATIONS.iter().sum();
    let segs: Vec<Svgr> = (0..6)
        .map(|i| {
            let x0 = 160.0 + 1600.0 * global_time(&DURATIONS, i, 0.0) / total;
            let w = 1600.0 * DURATIONS[i] / total - 10.0;
            let fill = if i < shot { 1.0 } else if i == shot { clamp01(t / DURATIONS[i]) } else { 0.0 };
            fframes::svgr!(<g>
                <rect x={x0} y="982" width={w} height="6" rx="3" fill={RULE} />
                <rect x={x0} y="982" width={(w * fill).max(0.5)} height="6" rx="3" fill={COBALT} opacity={if fill > 0.0 { 1.0 } else { 0.0 }} />
            </g>)
        })
        .collect();
    fframes::svgr!(<g>
        {mark(136.0, 76.0, 64.0, INK, COBALT)}
        <text x="200" y="126" font-family={SANS} font-size="34" font-weight="700" letter-spacing="-0.5" fill={INK}>"kahraman"</text>
        <text x="384" y="125" font-family={MONO} font-size="28" font-weight="400" fill={MUTE}>"accessibility-first test actor"</text>
        <text x="1760" y="125" text-anchor="end" font-family={MONO} font-size="28" font-weight="400" fill={MUTE}>{format!("{:02} / 06", shot + 1)}</text>
        {segs}
    </g>)
}

fn sans_line<'a>(
    text: &'static str,
    x: f32,
    y: f32,
    size: f32,
    fill: &'static str,
    t: f32,
    start: f32,
) -> Svgr<'a> {
    let (o, dy) = enter(t, start, 40.0);
    fframes::svgr!(<text x={x} y={y + dy} opacity={o} font-family={SANS} font-size={size} font-weight="700" letter-spacing="-2" fill={fill}>{text}</text>)
}

fn mono<'a>(text: String, x: f32, y: f32, size: f32, fill: &'static str) -> Svgr<'a> {
    fframes::svgr!(<text x={x} y={y} font-family={MONO} font-size={size} font-weight="400" fill={fill}>{text}</text>)
}

/// Four cobalt corner brackets around a rectangle.
fn brackets<'a>(x: f32, y: f32, w: f32, h: f32, opacity: f32) -> Svgr<'a> {
    let g = 12.0;
    let l = 26.0;
    let (x0, y0, x1, y1) = (x - g, y - g, x + w + g, y + h + g);
    let d = format!(
        "M{x0:.1} {:.1}V{y0:.1}H{:.1}M{:.1} {y0:.1}H{x1:.1}V{:.1}M{x1:.1} {:.1}V{y1:.1}H{:.1}M{:.1} {y1:.1}H{x0:.1}V{:.1}",
        y0 + l,
        x0 + l,
        x1 - l,
        y0 + l,
        y1 - l,
        x1 - l,
        x0 + l,
        y1 - l
    );
    fframes::svgr!(<path d={d} fill="none" stroke={COBALT} stroke-width="5" stroke-linecap="square" opacity={clamp01(opacity)} />)
}

/// Accessibility-tree row: role in ink, accessible name in cobalt.
fn tree_row<'a>(role: &'static str, name: &'static str, x: f32, y: f32, size: f32) -> Svgr<'a> {
    fframes::svgr!(<text x={x} y={y} font-family={MONO} font-size={size} font-weight="400" fill={INK}>{role}<tspan fill={COBALT}>{name}</tspan></text>)
}

// 01. the actor: one capital I, many verbs.
fn actor<'a>(t: f32) -> Svgr<'a> {
    let verbs = ["see", "fill", "click", "waitExit"];
    let mut pos = 0.0;
    for i in 1..4 {
        pos += out_expo(ramp(t, hit(0, i), 0.45));
    }
    let slots: Vec<Svgr> = verbs
        .iter()
        .enumerate()
        .map(|(i, v)| {
            let off = i as f32 - pos;
            let y = 640.0 + off * 300.0;
            let o = clamp01(1.0 - off.abs() * 1.2);
            fframes::svgr!(<text x="430" y={y} opacity={o} font-family={SANS} font-size="230" font-weight="700" letter-spacing="-6" fill={INK}>{*v}</text>)
        })
        .collect();
    // caret after the verb blinks between switches
    let caret_o = if (t * 2.2).fract() < 0.6 { 1.0 } else { 0.25 };
    let (c_o, c_dy) = enter(t, hit(0, 4), 20.0);
    let (s_o, _) = enter(t, hit(0, 0) + 0.25, 0.0);
    fframes::svgr!(<g>
        <defs>
            <clipPath id="kh-verb-window"><rect x="410" y="430" width="1350" height="270" /></clipPath>
        </defs>
        {mark(64.0, 318.0, 357.0, INK, COBALT)}
        <g clip-path="url(#kh-verb-window)">{slots}</g>
        <rect x="434" y="672" width="120" height="10" fill={COBALT} opacity={caret_o} />
        {sans_line("Test what users perceive.", 160.0, 830.0, 96.0, INK, t, hit(0, 0))}
        <text x="160" y="892" opacity={s_o} font-family={MONO} font-size="28" font-weight="400" fill={MUTE}>"codecept-style actor · Storybook · Vitest"</text>
        <g opacity={c_o} transform={tr(0.0, c_dy)}>
            <text x="1760" y="892" text-anchor="end" font-family={MONO} font-size="32" font-weight="400" fill={COBALT}>"const I = createActor()"</text>
        </g>
    </g>)
}

// 02. a locator resolves through the accessibility tree, not the DOM.
fn locate<'a>(t: f32) -> Svgr<'a> {
    let rows: [(&str, &str, f32); 3] = [
        ("heading ", "\"Sign in\"", 530.0),
        ("textbox ", "\"Email\"", 620.0),
        ("button ", "\"Continue\"", 710.0),
    ];
    let trunk = out_cubic(ramp(t, hit(1, 0) - 0.2, 0.5));
    let tree_rows: Vec<Svgr> = rows
        .iter()
        .enumerate()
        .map(|(i, (role, name, y))| {
            let (o, dy) = enter(t, hit(1, 0) + i as f32 * 0.1, 24.0);
            fframes::svgr!(<g opacity={o} transform={tr(0.0, dy)}>
                <path d={format!("M990 {:.1}H1030", y - 11.0)} stroke={INK} stroke-width="2" />
                {tree_row(role, name, 1048.0, *y, 36.0)}
            </g>)
        })
        .collect();
    let loc = "button('Continue')";
    let typed_loc: String = loc
        .chars()
        .take(((t - hit(1, 1)) * 30.0).max(0.0) as usize)
        .collect();
    let chip_o = clamp01(ramp(t, hit(1, 1) - 0.25, 0.2));
    let lock = out_cubic(ramp(t, hit(1, 2), 0.4));
    let row_hl = clamp01(ramp(t, hit(1, 2) + 0.15, 0.2));
    let br_s = 1.0 + 0.3 * (1.0 - spring(t - hit(1, 2) - 0.2));
    let br_o = clamp01(ramp(t, hit(1, 2) + 0.2, 0.1));
    // button rect in the card, scaled about its centre for the snap
    let (bx, by, bw, bh) = (196.0, 664.0, 280.0, 80.0);
    let (cx, cy) = (bx + bw / 2.0, by + bh / 2.0);
    let beam = "M1194 800V730M1032 698H492";
    let (n_o, n_dy) = enter(t, hit(1, 3), 16.0);
    fframes::svgr!(<g>
        {sans_line("Find it by role and name.", 160.0, 240.0, 84.0, INK, t, 0.1)}
        <rect x="160" y="300" width="680" height="560" rx="20" fill={CARD} stroke={RULE} stroke-width="2" />
        <text x="196" y="350" font-family={MONO} font-size="28" font-weight="400" fill={MUTE}>"story canvas"</text>
        <text x="196" y="456" font-family={SANS} font-size="64" font-weight="700" letter-spacing="-1.5" fill={INK}>"Sign in"</text>
        <text x="196" y="530" font-family={SANS} font-size="30" font-weight="400" fill={MUTE}>"Email"</text>
        <rect x="196" y="548" width="600" height="76" rx="12" fill={WHITE} stroke={INK} stroke-width="2" />
        <rect x={bx} y={by} width={bw} height={bh} rx="40" fill={COBALT} />
        <text x={cx} y="715" text-anchor="middle" font-family={SANS} font-size="32" font-weight="700" fill={WHITE}>"Continue"</text>
        <text x="196" y="820" opacity={n_o} transform={tr(0.0, n_dy)} font-family={MONO} font-size="28" font-weight="400" fill={COBALT}>"role: button · name: Continue"</text>
        <g transform={format!("translate({:.1} {:.1}) scale({br_s:.3})", cx * (1.0 - br_s), cy * (1.0 - br_s))}>{brackets(bx, by, bw, bh, br_o)}</g>
        <text x="960" y="360" font-family={MONO} font-size="28" font-weight="400" fill={MUTE}>"accessibility tree"</text>
        <text x="960" y="440" font-family={MONO} font-size="36" font-weight="400" fill={MUTE}>"main"</text>
        <path d="M990 460V699" stroke={INK} stroke-width="2" stroke-dasharray="240" stroke-dashoffset={format!("{:.1}", dash_offset(240.0, trunk))} />
        <rect x="1032" y="668" width="440" height="60" rx="10" fill={COBALT_SOFT} opacity={row_hl} />
        {tree_rows}
        <path d={beam} fill="none" stroke={COBALT} stroke-width="4" stroke-linejoin="round" stroke-dasharray="700" stroke-dashoffset={format!("{:.1}", dash_offset(700.0, lock))} opacity={clamp01(lock * 4.0) * (1.0 - 0.6 * ramp(t, hit(1, 3), 0.5))} />
        <g opacity={chip_o}>
            <rect x="944" y="800" width="500" height="80" rx="14" fill={INK} />
            <text x="972" y="853" font-family={MONO} font-size="38" font-weight="400" fill={WHITE}>{typed_loc}</text>
        </g>
    </g>)
}

// 03. the README sign-in test runs and the canvas answers each line.
fn run<'a>(t: f32) -> Svgr<'a> {
    let h = |i: usize| hit(2, i);
    let swap = ramp(t, h(3) + 0.45, 0.3);
    let form_o = 1.0 - swap;
    let email = "ada@example.com";
    let typed_email: String = email
        .chars()
        .take(((t - h(1) - 0.1) * 22.0).max(0.0) as usize)
        .collect();
    let press = if t >= h(2) && t < h(2) + 0.25 {
        0.95
    } else {
        1.0
    };
    let status_o = clamp01(ramp(t, h(2) + 0.1, 0.15)) * (1.0 - ramp(t, h(3) + 0.2, 0.3));
    let spin = t * 400.0;
    // focus brackets travel from target to target
    let targets: [(f32, f32, f32, f32); 5] = [
        (212.0, 270.0, 250.0, 80.0),
        (220.0, 418.0, 640.0, 76.0),
        (900.0, 418.0, 300.0, 76.0),
        (1268.0, 418.0, 320.0, 76.0),
        (212.0, 270.0, 430.0, 80.0),
    ];
    let mut rect = targets[0];
    for (i, &b) in targets.iter().enumerate().skip(1) {
        let p = spring(t - h(i) + 0.05).min(1.15);
        if t >= h(i) - 0.05 {
            let a = rect;
            rect = (
                lerp(a.0, b.0, p),
                lerp(a.1, b.1, p),
                lerp(a.2, b.2, p),
                lerp(a.3, b.3, p),
            );
        }
    }
    let br_o = clamp01(ramp(t, h(0), 0.2));
    let lines: Vec<Svgr> = TEST
        .iter()
        .enumerate()
        .map(|(i, line)| {
            let y = 668.0 + i as f32 * 50.0;
            let start = if i == 0 { -1.0 } else { h(i - 1) };
            let done_at = match i {
                0 => 0.15,
                4 => h(3) + 0.5,
                _ => start + 0.35,
            };
            let next = if i < 5 { h(i) } else { 99.0 };
            let active = t >= start && t < next.max(done_at);
            let fill = if t >= start { INK } else { MUTE };
            let o = if t >= start { 1.0 } else { 0.55 };
            let ok = out_cubic(ramp(t, done_at, 0.2));
            let cx = 196.0 + line.chars().count() as f32 * 30.0 * MONO_ADV + 30.0;
            fframes::svgr!(<g opacity={o}>
                <rect x="160" y={y - 30.0} width="6" height="40" fill={COBALT} opacity={if active { 1.0 } else { 0.0 }} />
                {mono(line.to_string(), 196.0, y, 30.0, fill)}
                <path d={check_path(cx, y - 10.0, 26.0)} fill="none" stroke={COBALT} stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity={ok} />
            </g>)
        })
        .collect();
    fframes::svgr!(<g>
        <rect x="160" y="176" width="1600" height="400" rx="20" fill={CARD} stroke={RULE} stroke-width="2" />
        <text x="196" y="224" font-family={MONO} font-size="28" font-weight="400" fill={MUTE}>"story canvas"</text>
        <text x="220" y="334" opacity={form_o} font-family={SANS} font-size="64" font-weight="700" letter-spacing="-1.5" fill={INK}>"Sign in"</text>
        <text x="220" y="334" opacity={swap} font-family={SANS} font-size="64" font-weight="700" letter-spacing="-1.5" fill={INK}>"Welcome, Ada"</text>
        <g opacity={form_o}>
            <text x="220" y="402" font-family={SANS} font-size="28" font-weight="400" fill={MUTE}>"Email"</text>
            <rect x="220" y="418" width="640" height="76" rx="12" fill={WHITE} stroke={INK} stroke-width="2" />
            <text x="244" y="468" font-family={SANS} font-size="34" font-weight="400" fill={INK}>{typed_email}</text>
            <g transform={format!("translate({:.1} {:.1}) scale({press:.3})", 1050.0 * (1.0 - press), 456.0 * (1.0 - press))}>
                <rect x="900" y="418" width="300" height="76" rx="38" fill={COBALT} />
                <text x="1050" y="467" text-anchor="middle" font-family={SANS} font-size="32" font-weight="700" fill={WHITE}>"Continue"</text>
            </g>
        </g>
        <g opacity={status_o}>
            <circle cx="1310" cy="456" r="22" fill="none" stroke={RULE} stroke-width="6" />
            <path d="M1310 434A22 22 0 0 1 1332 456" fill="none" stroke={COBALT} stroke-width="6" stroke-linecap="round" transform={format!("rotate({spin:.1} 1310 456)")} />
            <text x="1350" y="467" font-family={SANS} font-size="32" font-weight="400" fill={INK}>"Signing in"</text>
        </g>
        {brackets(rect.0, rect.1, rect.2.max(1.0), rect.3.max(1.0), br_o)}
        {lines}
    </g>)
}

// 04. a failure lists every step and points at the story line that made it.
fn trace<'a>(t: f32) -> Svgr<'a> {
    let lines: Vec<Svgr> = TRACE
        .iter()
        .enumerate()
        .map(|(i, label)| {
            let at = hit(3, i);
            let y = 420.0 + i as f32 * 52.0;
            let (o, dx) = (out_cubic(ramp(t, at, 0.2)), (1.0 - out_expo(ramp(t, at, 0.4))) * 30.0);
            let fail = i == 4;
            let mark = if fail {
                let shake = if t >= at && t < at + 0.3 { ((t - at) * 60.0).sin() * 6.0 * (1.0 - (t - at) / 0.3) } else { 0.0 };
                fframes::svgr!(<path d={cross_path(214.0 + shake, y - 11.0, 22.0)} fill="none" stroke={RED} stroke-width="5" stroke-linecap="round" />)
            } else {
                fframes::svgr!(<path d={check_path(214.0, y - 10.0, 26.0)} fill="none" stroke={DARK_TEXT} stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />)
            };
            fframes::svgr!(<g opacity={o} transform={tr(dx, 0.0)}>
                {mark}
                {mono(label.to_string(), 250.0, y, 32.0, if fail { FAIL_TEXT } else { DARK_TEXT })}
            </g>)
        })
        .collect();
    let jump = out_cubic(ramp(t, hit(3, 5) - 0.2, 0.4));
    let (f_o, f_dy) = enter(t, hit(3, 5), 40.0);
    let squiggle_w = 30.0 * 30.0 * MONO_ADV;
    let sq = out_cubic(ramp(t, hit(3, 5) + 0.3, 0.4));
    fframes::svgr!(<g>
        {sans_line("Failures point at your line.", 160.0, 240.0, 84.0, INK, t, 0.0)}
        <rect x="160" y="300" width="1600" height="358" rx="20" fill={DARK} />
        <text x="200" y="352" font-family={MONO} font-size="28" font-weight="400" fill={DARK_MUTE}>"step trace"</text>
        {lines}
        <g opacity={f_o} transform={tr(0.0, f_dy)}>
            <rect x="160" y="700" width="1600" height="190" rx="20" fill={CARD} stroke={RULE} stroke-width="2" />
            {mono("  11 |   await I.waitExit(role('status'))".to_string(), 200.0, 772.0, 30.0, MUTE)}
            <text x="200" y="836" font-family={MONO} font-size="30" font-weight="400" fill={INK}><tspan fill={RED}>">"</tspan>" 12 |   await I.see(heading('Welcome, Ada'))"</text>
            <path d={format!("M{:.1} 852H{:.1}", 200.0 + 15.0 * 18.0, 200.0 + 15.0 * 18.0 + squiggle_w * sq.max(0.01))} stroke={RED} stroke-width="3" stroke-dasharray="6 5" />
            <text x="1720" y="772" text-anchor="end" font-family={MONO} font-size="28" font-weight="400" fill={MUTE}>"your story file"</text>
        </g>
        <path d="M214 646V806" fill="none" stroke={RED} stroke-width="4" stroke-linecap="round" stroke-dasharray="160" stroke-dashoffset={format!("{:.1}", dash_offset(160.0, jump))} opacity={clamp01(jump * 3.0)} />
    </g>)
}

// 05. the actor reads two fields of the story context, so any renderer works.
fn context<'a>(t: f32) -> Svgr<'a> {
    let fields = [
        "id",
        "args",
        "globals",
        "parameters",
        "canvasElement",
        "userEvent",
        "viewMode",
    ];
    let pick = clamp01(ramp(t, hit(4, 0), 0.25));
    let rows: Vec<Svgr> = fields
        .iter()
        .enumerate()
        .map(|(i, f)| {
            let y = 436.0 + i as f32 * 62.0;
            let chosen = i == 4 || i == 5;
            let o = if chosen { 1.0 } else { 1.0 - 0.55 * pick };
            fframes::svgr!(<g opacity={o}>
                <rect x="180" y={y - 40.0} width="480" height="56" rx="10" fill={COBALT_SOFT} opacity={if chosen { pick } else { 0.0 }} />
                {mono(f.to_string(), 200.0, y, 34.0, if chosen && pick > 0.5 { COBALT } else { INK })}
            </g>)
        })
        .collect();
    let wire = out_cubic(ramp(t, hit(4, 0) + 0.1, 0.5));
    let node = spring(t - hit(4, 1));
    let fan = out_cubic(ramp(t, hit(4, 2) - 0.2, 0.4));
    let chips: Vec<Svgr> = ["React", "Vue", "Svelte"]
        .iter()
        .enumerate()
        .map(|(i, name)| {
            let y = 400.0 + i as f32 * 150.0;
            let (o, _) = enter(t, hit(4, 2) + i as f32 * 0.1, 0.0);
            let s = 0.9 + 0.1 * spring(t - hit(4, 2) - i as f32 * 0.1).min(1.1);
            let d = format!("M1066 590C1150 590 1150 {:.1} 1240 {:.1}", y + 55.0, y + 55.0);
            fframes::svgr!(<g>
                <path d={d} fill="none" stroke={INK} stroke-width="3" stroke-dasharray="300" stroke-dashoffset={format!("{:.1}", dash_offset(300.0, fan))} />
                <g opacity={o} transform={format!("translate({:.1} {:.1}) scale({s:.3})", 1500.0 * (1.0 - s), (y + 55.0) * (1.0 - s))}>
                    <rect x="1240" y={y} width="520" height="110" rx="55" fill={CARD} stroke={INK} stroke-width="3" />
                    <text x="1300" y={y + 72.0} font-family={SANS} font-size="52" font-weight="700" letter-spacing="-1" fill={INK}>{*name}</text>
                </g>
            </g>)
        })
        .collect();
    let node_s = 0.85 + 0.15 * node.min(1.1);
    fframes::svgr!(<g>
        {sans_line("React, Vue or Svelte. Same actor.", 160.0, 240.0, 84.0, INK, t, 0.0)}
        <rect x="160" y="310" width="520" height="560" rx="20" fill={CARD} stroke={RULE} stroke-width="2" />
        <text x="200" y="364" font-family={MONO} font-size="28" font-weight="400" fill={MUTE}>"story context"</text>
        {rows}
        <path d="M660 684C760 684 780 590 856 590M660 746C760 746 780 590 856 590" fill="none" stroke={COBALT} stroke-width="4" stroke-dasharray="320" stroke-dashoffset={format!("{:.1}", dash_offset(320.0, wire))} />
        <g transform={format!("translate({:.1} {:.1}) scale({node_s:.3})", 960.0 * (1.0 - node_s), 590.0 * (1.0 - node_s))}>
            <circle cx="960" cy="590" r="104" fill={INK} />
            {mark(889.0, 519.0, 142.0, WHITE, COBALT_LIGHT)}
        </g>
        {chips}
        <text x="160" y="930" font-family={MONO} font-size="28" font-weight="400" fill={MUTE}>"reads only canvasElement and userEvent"</text>
        <text x="1760" y="930" text-anchor="end" font-family={MONO} font-size="28" font-weight="400" fill={MUTE}>"Storybook 9, 10, 11 · Vitest"</text>
    </g>)
}

// 06. closing card.
fn outro<'a>(t: f32) -> Svgr<'a> {
    let (w_o, w_dy) = enter(t, 0.1, 60.0);
    let (g_o, g_dy) = enter(t, hit(5, 0), 30.0);
    let (u_o, u_dy) = enter(t, hit(5, 0) + 0.2, 30.0);
    let drift = (t * 0.9).sin() * 6.0;
    let cmd = "npm install --save-dev kahraman";
    let cmd_w = cmd.len() as f32 * 34.0 * MONO_ADV + 72.0;
    fframes::svgr!(<g>
        {mark(1080.0, 285.0 + drift, 620.0, COBALT, COBALT)}
        <text x="150" y={470.0 + w_dy} opacity={w_o} font-family={SANS} font-size="180" font-weight="700" letter-spacing="-7" fill={INK}>"kahraman"</text>
        <text x="160" y={566.0 + g_dy} opacity={g_o} font-family={SANS} font-size="60" font-weight="400" letter-spacing="-1" fill={INK}>"Test what users perceive."</text>
        <g opacity={g_o} transform={tr(0.0, g_dy)}>
            <rect x="160" y="616" width={cmd_w} height="84" rx="42" fill={INK} />
            {mono(cmd.to_string(), 196.0, 670.0, 34.0, PAPER)}
        </g>
        <g opacity={u_o} transform={tr(0.0, u_dy)}>
            <text x="160" y="820" font-family={SANS} font-size="44" font-weight="700" letter-spacing="-1" fill={COBALT}>"github.com/apphane-dev/kahraman"</text>
            {mono("MIT · ESM · Node 22.12+".to_string(), 160.0, 884.0, 28.0, MUTE)}
        </g>
    </g>)
}

/// Canonical font-independent I. mark from brand/geometry.json, on a 1000-unit grid.
fn mark<'a>(x: f32, y: f32, size: f32, ink: &'static str, accent: &'static str) -> Svgr<'a> {
    fframes::svgr!(<g transform={format!("translate({x} {y}) scale({})", size / 1000.0)}>
        <path d={STEM} fill={ink} />
        <path d={DOT} fill={accent} />
    </g>)
}
