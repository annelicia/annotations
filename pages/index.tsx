import Head from "next/head";
import { ChangeEvent, useState } from "react";
import ImageWithTools from "../components/ImageWithTools";

export default function Home() {
  const [chosenImg, setChosenImg] = useState<string | undefined>();

  const handleChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    const inputElement = e.target;
    if (!inputElement.files) return;
    setChosenImg(URL.createObjectURL(inputElement.files[0]));
  }

  return (
    <>
      <Head>
        <title>Annotations Tool</title>
        <link rel="icon" href="/app-icon-pen.svg" />
      </Head>
      {!chosenImg ?
        (
          <>
            <div className="flex flex-col gap-10 justify-center items-center h-screen w-screen">
              <div className="flex gap-5 items-center text-5xl">
                <img src="./image-rabbit.svg" width="50" height="50" />
                <h1 className="font-bold text-center">Welcome to Annotations Tool</h1>
                <img src="./image-shapes.svg" width="50" height="50" />
              </div>
              <div className="text-center">Please choose an image to start drawing</div>
              <img src="./image-drawing.svg" width="100" height="80" />
              <input
                type="file"
                onChange={handleChangeInput}
              />
            </div>
          </>
        ) : (
          <ImageWithTools chosenImg={chosenImg} />
        )}
    </>
  );
}
