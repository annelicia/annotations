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
          <div className="flex justify-center items-center h-screen w-screen">
            <input
              type="file"
              onChange={handleChangeInput}
            />
          </div>
        ) : (
          <ImageWithTools chosenImg={chosenImg} />
        )}
    </>
  );
}
