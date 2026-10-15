use std::{env, error::Error, fs, path::PathBuf};

fn main() -> Result<(), Box<dyn Error>> {
    let root =
        PathBuf::from(env::var_os("CARGO_MANIFEST_DIR").ok_or("missing manifest directory")?);
    let brand = root.join("../brand");
    let mut generated = String::from("// Generated from the repo's brand assets. Do not edit.\n");
    for (file, section) in [
        ("tokens.json", Some("colors")),
        ("tokens.json", Some("fonts")),
        ("geometry.json", None),
    ] {
        println!("cargo:rerun-if-changed={}", brand.join(file).display());
        let json: serde_json::Value = serde_json::from_str(&fs::read_to_string(brand.join(file))?)?;
        let values = section.map_or(&json, |name| &json[name]);
        for (name, value) in values.as_object().ok_or("brand object expected")? {
            let text = value.as_str().ok_or("brand string expected")?;
            generated.push_str(&format!(
                "pub const {}: &str = {text:?};\n",
                name.to_uppercase()
            ));
        }
    }
    let out = PathBuf::from(env::var_os("OUT_DIR").ok_or("missing output directory")?);
    fs::write(out.join("brand.rs"), generated)?;
    // fframes 1.2.0's Linux FFmpeg prebuilt needs the genuine x264 ABI 163.
    let native = root.join(".native");
    println!("cargo:rerun-if-changed=.native");
    if env::var("CARGO_CFG_TARGET_OS").as_deref() == Ok("linux")
        && native.join("libx264.so").exists()
    {
        println!("cargo:rustc-link-search=native={}", native.display());
        println!("cargo:rustc-link-arg=-Wl,-rpath,{}", native.display());
    }
    Ok(())
}
