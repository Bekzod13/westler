/* eslint-disable @next/next/no-img-element -- layered Figma vector exports */
import * as Img from "@/lib/westler-assets";

export type WestlerIconProps = {
  className?: string;
  variant?: "2" | "4" | "6" | "8" | "10" | "12" | "15" | "16" | "17" | "18" | "19" | "21" | "22" | "23" | "24" | "25" | "26";
};

export function WestlerIcon({ className, variant = "2" }: WestlerIconProps) {
  const is10 = variant === "10";
  const is12 = variant === "12";
  const is15 = variant === "15";
  const is15Or16Or17Or18Or19 = ["15", "16", "17", "18", "19"].includes(variant);
  const is15Or16Or17Or18Or19Or21Or23 = ["15", "16", "17", "18", "19", "21", "23"].includes(variant);
  const is16 = variant === "16";
  const is17 = variant === "17";
  const is18 = variant === "18";
  const is19 = variant === "19";
  const is2 = variant === "2";
  const is21 = variant === "21";
  const is22 = variant === "22";
  const is23 = variant === "23";
  const is24 = variant === "24";
  const is25 = variant === "25";
  const is26 = variant === "26";
  const is2Or4Or12 = ["2", "4", "12"].includes(variant);
  const is4 = variant === "4";
  const is6 = variant === "6";
  const is8 = variant === "8";
  const sizeClass = ["21", "22", "23", "24", "25", "26"].includes(variant)
    ? "size-[24px]"
    : is15Or16Or17Or18Or19
      ? "size-[20px]"
      : "size-[32px]";
  return (
    <div
      aria-hidden
      className={`overflow-clip relative ${sizeClass}${className ? ` ${className}` : ""}`}
      id={is26 ? "node-10_1538" : is25 ? "node-10_1535" : is24 ? "node-10_1532" : is23 ? "node-10_1528" : is22 ? "node-10_1526" : is21 ? "node-10_1522" : is19 ? "node-10_222" : is18 ? "node-10_219" : is17 ? "node-10_216" : is16 ? "node-10_213" : is15 ? "node-10_210" : is12 ? "node-10_193" : is10 ? "node-10_182" : is8 ? "node-10_173" : is6 ? "node-10_165" : is4 ? "node-10_154" : "node-10_131"}>
      <div className={`${String.raw`absolute opacity-[var(--opacity\/100,1)] `}${is26 ? "inset-[12.47%_12.47%_8.33%_8.33%]" : is25 ? "inset-[29.17%_8.33%]" : is24 ? "inset-[12.5%]" : is22 ? "inset-[8.33%_16.67%_8.32%_16.67%]" : is15Or16Or17Or18Or19Or21Or23 ? "inset-[8.33%]" : is12 ? "bottom-1/4 left-1/4 right-[41.67%] top-3/4" : is10 ? "inset-[8.33%_19.22%]" : is8 ? "inset-[91.67%_37.5%_8.33%_12.5%]" : is6 ? "inset-[22.08%_54.17%_32.08%_12.5%]" : is4 ? "bottom-[8.33%] left-1/4 right-1/4 top-[8.33%]" : "inset-[16.67%]"}`} data-name="Vector" id={is26 ? "node-10_1539" : is25 ? "node-10_1536" : is24 ? "node-10_1533" : is23 ? "node-10_1529" : is22 ? "node-10_1527" : is21 ? "node-10_1523" : is19 ? "node-10_223" : is18 ? "node-10_220" : is17 ? "node-10_217" : is16 ? "node-10_214" : is15 ? "node-10_211" : is12 ? "node-10_194" : is10 ? "node-10_183" : is8 ? "node-10_174" : is6 ? "node-10_166" : is4 ? "node-10_155" : "node-10_132"}>
        <div className={`absolute ${is26 ? "inset-[-5.26%]" : is25 ? "inset-[-10%_-5%]" : is24 ? "inset-[-5.56%]" : is22 ? "inset-[-5%_-6.25%]" : is15Or16Or17Or18Or19Or21Or23 ? "inset-[-5%]" : is12 ? "inset-[-1.33px_-12.5%]" : is10 ? "inset-[-5%_-6.77%]" : is8 ? "inset-[-1.33px_-8.33%]" : is6 ? "inset-[-9.09%_-12.5%]" : is4 ? "inset-[-5%_-8.33%]" : "inset-[-6.25%]"}`}>
          <img alt="" className="block max-w-none size-full" src={is26 ? Img.imgVector43 : is25 ? Img.imgVector41 : is24 ? Img.imgVector39 : is22 ? Img.imgVector36 : ["21", "23"].includes(variant) ? Img.imgVector33 : is15Or16Or17Or18Or19 ? Img.imgVector31 : is12 ? Img.imgVector8 : is10 ? Img.imgVector24 : is8 ? Img.imgVector20 : is6 ? Img.imgVector18 : is4 ? Img.imgVector14 : Img.imgVector} />
        </div>
      </div>
      {["2", "4", "6", "8", "10", "12", "15", "16", "17", "18", "19", "21", "23", "24", "25"].includes(variant) && (
        <div className={`${String.raw`absolute opacity-[var(--opacity\/100,1)] `}${is25 ? "inset-[29.17%_8.33%_45.83%_66.67%]" : is24 ? "inset-[16.67%_8.33%_41.67%_37.5%]" : is23 ? "inset-[8.33%_33.33%]" : is21 ? "inset-1/4" : is15Or16Or17Or18Or19 ? "inset-[41.67%_37.5%]" : is12 ? "inset-[91.67%_12.5%_8.33%_12.5%]" : is10 ? "inset-[8.33%_35.42%_91.67%_35.42%]" : is8 ? "inset-[37.5%_41.67%_62.5%_16.67%]" : is6 ? "inset-[12.58%_12.5%_8.21%_37.87%]" : is4 ? "bottom-[8.33%] left-[8.33%] right-3/4 top-1/2" : "inset-[41.67%]"}`} data-name="Vector" id={is25 ? "node-10_1537" : is24 ? "node-10_1534" : is23 ? "node-10_1530" : is21 ? "node-10_1524" : is19 ? "node-10_224" : is18 ? "node-10_221" : is17 ? "node-10_218" : is16 ? "node-10_215" : is15 ? "node-10_212" : is12 ? "node-10_195" : is10 ? "node-10_184" : is8 ? "node-10_175" : is6 ? "node-10_167" : is4 ? "node-10_156" : "node-10_133"}>
          <div className={`absolute ${is25 ? "inset-[-16.67%]" : is24 ? "inset-[-10%_-7.69%]" : is23 ? "inset-[-5%_-12.5%]" : is21 ? "inset-[-8.33%]" : is15Or16Or17Or18Or19 ? "inset-[-25%_-16.67%]" : is12 ? "inset-[-1.33px_-5.56%]" : is10 ? "inset-[-1.33px_-14.29%]" : is8 ? "inset-[-1.33px_-10%]" : is6 ? "inset-[-5.26%_-8.4%]" : is4 ? "inset-[-10%_-25%]" : "inset-[-25%]"}`}>
            <img alt="" className="block max-w-none size-full" src={is25 ? Img.imgVector42 : is24 ? Img.imgVector40 : is23 ? Img.imgVector37 : is21 ? Img.imgVector34 : is15Or16Or17Or18Or19 ? Img.imgVector32 : is12 ? Img.imgVector27 : is10 ? Img.imgVector25 : is8 ? Img.imgVector21 : is6 ? Img.imgVector19 : is4 ? Img.imgVector15 : Img.imgVector1} />
          </div>
        </div>
      )}
      {["2", "4", "8", "10", "12", "21", "23"].includes(variant) && (
        <div className={`${String.raw`absolute opacity-[var(--opacity\/100,1)] `}${is23 ? "bottom-1/2 left-[8.33%] right-[8.33%] top-1/2" : is21 ? "inset-[41.67%]" : is12 ? "inset-[33.33%_12.5%_8.33%_54.17%]" : is10 ? "inset-[66.67%_29.17%_33.33%_29.17%]" : is8 ? "inset-[8.33%_41.67%_8.33%_16.67%]" : is4 ? "bottom-[8.33%] left-3/4 right-[8.33%] top-[37.5%]" : "bottom-[83.33%] left-1/2 right-1/2 top-[8.33%]"}`} data-name="Vector" id={is23 ? "node-10_1531" : is21 ? "node-10_1525" : is12 ? "node-10_196" : is10 ? "node-10_185" : is8 ? "node-10_176" : is4 ? "node-10_157" : "node-10_134"}>
          <div className={`absolute ${is23 ? "inset-[-1px_-5%]" : is21 ? "inset-[-25%]" : is12 ? "inset-[-7.14%_-12.5%]" : is10 ? "inset-[-1.33px_-10%]" : is8 ? "inset-[-5%_-10%]" : is4 ? "inset-[-7.69%_-25%]" : "inset-[-50%_-1.33px]"}`}>
            <img alt="" className="block max-w-none size-full" src={is23 ? Img.imgVector38 : is21 ? Img.imgVector35 : is12 ? Img.imgVector28 : is10 ? Img.imgVector26 : is8 ? Img.imgVector22 : is4 ? Img.imgVector16 : Img.imgVector2} />
          </div>
        </div>
      )}
      {["2", "4", "8", "12"].includes(variant) && (
        <div className={`${String.raw`absolute opacity-[var(--opacity\/100,1)] `}${is12 ? "inset-[58.33%_54.17%_41.67%_37.5%]" : is8 ? "inset-[20.83%_8.33%_20.83%_58.33%]" : is4 ? "bottom-3/4 left-[41.67%] right-[41.67%] top-1/4" : "bottom-[8.33%] left-1/2 right-1/2 top-[83.33%]"}`} data-name="Vector" id={is12 ? "node-10_197" : is8 ? "node-10_177" : is4 ? "node-10_158" : "node-10_135"}>
          <div className={`absolute ${is12 ? "inset-[-1.33px_-50%]" : is8 ? "inset-[-7.14%_-12.5%]" : is4 ? "inset-[-1.33px_-25%]" : "inset-[-50%_-1.33px]"}`}>
            <img alt="" className="block max-w-none size-full" src={is12 ? Img.imgVector9 : is8 ? Img.imgVector23 : is4 ? Img.imgVector17 : Img.imgVector3} />
          </div>
        </div>
      )}
      {is2Or4Or12 && (
        <>
          <div className={`${String.raw`absolute opacity-[var(--opacity\/100,1)] `}${is12 ? "bottom-1/2 left-[29.17%] right-[45.83%] top-1/4" : is4 ? "inset-[41.67%_41.67%_58.33%_41.67%]" : "inset-[78.87%_29.17%_13.92%_66.67%]"}`} data-name="Vector" id={is12 ? "node-10_198" : is4 ? "node-10_159" : "node-10_136"}>
            <div className={`absolute ${is12 ? "inset-[-16.67%]" : is4 ? "inset-[-1.33px_-25%]" : "inset-[-57.81%_-100.02%]"}`}>
              <img alt="" className="block max-w-none size-full" src={is12 ? Img.imgVector29 : is4 ? Img.imgVector17 : Img.imgVector4} />
            </div>
          </div>
          <div className={`${String.raw`absolute opacity-[var(--opacity\/100,1)] `}${is12 ? "bottom-3/4 left-[33.33%] right-1/2 top-[8.33%]" : is4 ? "inset-[58.33%_41.67%_41.67%_41.67%]" : "inset-[13.92%_54.17%_57.21%_29.17%]"}`} data-name="Vector" id={is12 ? "node-10_199" : is4 ? "node-10_160" : "node-10_137"}>
            <div className={`absolute ${is12 ? "inset-[-25%]" : is4 ? "inset-[-1.33px_-25%]" : "inset-[-14.43%_-25%]"}`}>
              <img alt="" className="block max-w-none size-full" src={is12 ? Img.imgVector30 : is4 ? Img.imgVector17 : Img.imgVector5} />
            </div>
          </div>
        </>
      )}
      {["2", "4"].includes(variant) && (
        <div className={`${String.raw`absolute opacity-[var(--opacity\/100,1)] `}${is4 ? "bottom-1/4 left-[41.67%] right-[41.67%] top-3/4" : "inset-[66.67%_13.92%_29.17%_78.87%]"}`} data-name="Vector" id={is4 ? "node-10_161" : "node-10_138"}>
          <div className={`absolute ${is4 ? "inset-[-1.33px_-25%]" : "inset-[-100.02%_-57.81%]"}`}>
            <img alt="" className="block max-w-none size-full" src={is4 ? Img.imgVector17 : Img.imgVector6} />
          </div>
        </div>
      )}
      {is2 && (
        <>
          <div className="absolute inset-[29.17%_78.88%_66.67%_13.92%] opacity-[var(--opacity\/100,1)]" data-name="Vector" data-node-id="10:139">
            <div className="absolute inset-[-100.02%_-57.81%]">
              <img alt="" className="block max-w-none size-full" src={Img.imgVector7} />
            </div>
          </div>
          <div className="absolute bottom-1/2 left-[58.33%] opacity-[var(--opacity\/100,1)] right-[8.33%] top-1/2" data-name="Vector" data-node-id="10:140">
            <div className="absolute inset-[-1.33px_-12.5%]">
              <img alt="" className="block max-w-none size-full" src={Img.imgVector8} />
            </div>
          </div>
          <div className="absolute bottom-1/2 left-[8.33%] opacity-[var(--opacity\/100,1)] right-[83.33%] top-1/2" data-name="Vector" data-node-id="10:141">
            <div className="absolute inset-[-1.33px_-50%]">
              <img alt="" className="block max-w-none size-full" src={Img.imgVector9} />
            </div>
          </div>
          <div className="absolute inset-[29.17%_13.92%_66.67%_78.87%] opacity-[var(--opacity\/100,1)]" data-name="Vector" data-node-id="10:142">
            <div className="absolute inset-[-100.02%_-57.81%]">
              <img alt="" className="block max-w-none size-full" src={Img.imgVector10} />
            </div>
          </div>
          <div className="absolute inset-[66.67%_78.88%_29.17%_13.92%] opacity-[var(--opacity\/100,1)]" data-name="Vector" data-node-id="10:143">
            <div className="absolute inset-[-100.02%_-57.81%]">
              <img alt="" className="block max-w-none size-full" src={Img.imgVector11} />
            </div>
          </div>
          <div className="absolute inset-[13.92%_29.17%_78.88%_66.67%] opacity-[var(--opacity\/100,1)]" data-name="Vector" data-node-id="10:144">
            <div className="absolute inset-[-57.81%_-100.02%]">
              <img alt="" className="block max-w-none size-full" src={Img.imgVector12} />
            </div>
          </div>
          <div className="absolute inset-[57.21%_54.17%_13.92%_29.17%] opacity-[var(--opacity\/100,1)]" data-name="Vector" data-node-id="10:145">
            <div className="absolute inset-[-14.43%_-25%]">
              <img alt="" className="block max-w-none size-full" src={Img.imgVector13} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
