import { ChangeEvent, Dispatch, MutableRefObject, RefObject, SetStateAction, useRef } from "react";
import { ColorsType, ToolsType, WidthsPen } from "../constants/Enums";
import { Annotation, ImageSize } from "./ImageWithTools";

interface OptionToolsProps {
    selectedTool: ToolsType;
    setSelectedTool: Dispatch<SetStateAction<ToolsType>>;
    selectedColor: ColorsType;
    setSelectedColor: Dispatch<SetStateAction<ColorsType>>;
    annotations: Annotation[];
    setAnnotations: Dispatch<SetStateAction<Annotation[]>>;
    selectedAnnotation: number | undefined;
    setSelectedAnnotation: Dispatch<SetStateAction<number | undefined>>;
    contextCanvasRef: MutableRefObject<CanvasRenderingContext2D | undefined>;
    selectedWidthPen: WidthsPen;
    setSelectedWidthPen: Dispatch<SetStateAction<WidthsPen>>;
    imgRef: RefObject<HTMLImageElement>;
    svgRef: RefObject<SVGSVGElement>;
    canvasRef: RefObject<HTMLCanvasElement>;
    imageSize: ImageSize;
}

export default function OptionTools(optionToolsProps: OptionToolsProps) {
    const downloadRef = useRef<HTMLAnchorElement>(null);
    const { selectedTool,
        setSelectedTool,
        selectedColor,
        setSelectedColor,
        annotations,
        setAnnotations,
        selectedAnnotation,
        setSelectedAnnotation,
        contextCanvasRef,
        selectedWidthPen,
        setSelectedWidthPen,
        imgRef,
        svgRef,
        canvasRef,
        imageSize,
    } = optionToolsProps;

    const handleChangeTool = (tool: ToolsType) => {
        setSelectedTool(tool);
        setSelectedAnnotation(undefined);
    }

    const handleChangeColor = (color: ColorsType) => {
        if (selectedTool === ToolsType.RESIZE || selectedTool === ToolsType.MOVE) return;
        setSelectedColor(color);
        if (selectedAnnotation !== undefined) {
            setAnnotations(prev => [...prev.map((annotation, i) => {
                if (selectedAnnotation === i) {
                    return {
                        ...annotation,
                        color: color,
                    }
                } else {
                    return annotation;
                }
            })])
        }
    }

    const handleChangeWidthPen = (event: ChangeEvent<HTMLSelectElement>) => {
        const widthPen = event.target.value as unknown as WidthsPen;
        setSelectedWidthPen(widthPen);
    }

    const handleClickUndo = () => {
        if (!annotations.length) return;
        setAnnotations(prev => {
            return prev.slice(0, prev.length - 1);
        });

        const lastIndex = annotations.length - 1;
        if (selectedAnnotation === lastIndex) setSelectedAnnotation(undefined);

        const lastAnnotation = annotations[lastIndex];
        if (lastAnnotation && lastAnnotation.type === ToolsType.PEN && contextCanvasRef.current) {
            let img = new Image();
            img.onload = () => {
                if (contextCanvasRef.current) {
                    contextCanvasRef.current.clearRect(0, 0, contextCanvasRef.current.canvas.width, contextCanvasRef.current.canvas.height);
                    contextCanvasRef.current.drawImage(img, 0, 0)
                }
            };
            img.src = lastAnnotation.dataUrl;
        }
    }

    const handleClickRemoveAll = () => {
        setAnnotations([]);
        if (contextCanvasRef.current) {
            contextCanvasRef.current.clearRect(0, 0, contextCanvasRef.current.canvas.width, contextCanvasRef.current.canvas.height);
        }
    }

    const handleClickRemoveSelected = () => {
        setAnnotations(prev => [...prev.filter((_, i) => i !== selectedAnnotation)]);
        setSelectedAnnotation(undefined);
    }

    const handleClickDownload = () => {
        if (!svgRef.current) return;
        let canvas = document.createElement("canvas");
        canvas.width = imageSize.width;
        canvas.height = imageSize.height;
        let context = canvas.getContext("2d");

        const clonedSvgElement = svgRef.current.cloneNode(true) as SVGSVGElement;
        const outerHTML = clonedSvgElement.outerHTML;
        const blob = new Blob([outerHTML], { type: "image/svg+xml;charset=utf-8" });
        let blobURL = URL.createObjectURL(blob);
        let imgSVG = new Image();
        imgSVG.onload = () => {
            if (!context || !imgRef.current) return;
            context.drawImage(imgRef.current, 0, 0, imageSize.width, imageSize.height);

            context.drawImage(imgSVG, 0, 0, imageSize.width, imageSize.height);

            if (!canvasRef.current) return;
            const penURL = canvasRef.current.toDataURL();
            let imgPen = new Image();
            imgPen.onload = () => {
                if (!context) return;
                context.drawImage(imgPen, 0, 0, imageSize.width, imageSize.height);

                let png = canvas.toDataURL();
                const download = (href: string) => {
                    if (!downloadRef.current) return;
                    downloadRef.current.href = href;
                    downloadRef.current.click();
                }
                download(png);
            }
            imgPen.src = penURL;
        }
        imgSVG.src = blobURL;
    }

    return (
        <div className="flex items-center gap-5 flex-wrap mb-5">
            <div className="border-solid border-black-700 border-2 p-3 flex gap-5 flex-row items-center">
                <button className="w-8 h-8 rounded-lg flex items-center justify-center enabled:hover:bg-slate-300 disabled:opacity-30" disabled={annotations.length === 0}><img src="/undo.svg" width="25" height="25" onClick={handleClickUndo} /></button>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center enabled:hover:bg-slate-300 disabled:opacity-30" disabled={selectedTool !== ToolsType.SELECT || selectedAnnotation === undefined}><img src="/remove.svg" width="20" height="20" onClick={handleClickRemoveSelected} /></button>
                <button onClick={() => handleChangeTool(ToolsType.RESIZE)} data-ui={selectedTool === ToolsType.RESIZE ? "active" : ""} className="w-8 h-8 data-active:bg-slate-300 rounded-lg flex items-center justify-center"><img src="/resize.svg" width="18" height="18" /></button>
                <button onClick={() => handleChangeTool(ToolsType.MOVE)} data-ui={selectedTool === ToolsType.MOVE ? "active" : ""} className="w-8 h-8 data-active:bg-slate-300 rounded-lg flex items-center justify-center"><img src="/move.svg" width="18" height="18" /></button>
                <button onClick={() => handleChangeTool(ToolsType.SELECT)} data-ui={selectedTool === ToolsType.SELECT ? "active" : ""} className="w-8 h-8 data-active:bg-slate-300 rounded-lg flex items-center justify-center"><img src="/select.svg" width="18" height="18" /></button>
            </div>
            <div className="border-solid border-black-700 border-2 p-3 flex gap-5 flex-row items-center">
                <button onClick={() => handleChangeTool(ToolsType.TEXT)} data-ui={selectedTool === ToolsType.TEXT ? "active" : ""} className="w-8 h-8 data-active:bg-slate-300 rounded-lg flex items-center justify-center"><img src="/text.svg" width="18" height="18" /></button>
                <button onClick={() => handleChangeTool(ToolsType.CIRCLE_FRAME)} data-ui={selectedTool === ToolsType.CIRCLE_FRAME ? "active" : ""} className="w-8 h-8 data-active:bg-slate-300 rounded-lg flex items-center justify-center"><img src="/circle-frame.svg" width="18" height="18" /></button>
                <button onClick={() => handleChangeTool(ToolsType.CIRCLE)} data-ui={selectedTool === ToolsType.CIRCLE ? "active" : ""} className="w-8 h-8 data-active:bg-slate-300 rounded-lg flex items-center justify-center"><img src="/circle.svg" width="18" height="18" /></button>
                <button onClick={() => handleChangeTool(ToolsType.RECT_FRAME)} data-ui={selectedTool === ToolsType.RECT_FRAME ? "active" : ""} className="w-8 h-8 data-active:bg-slate-300 rounded-lg flex items-center justify-center"><img src="/rectangle-frame.svg" width="18" height="18" /></button>
                <button onClick={() => handleChangeTool(ToolsType.RECT)} data-ui={selectedTool === ToolsType.RECT ? "active" : ""} className="w-8 h-8 data-active:bg-slate-300 rounded-lg flex items-center justify-center"><img src="/rectangle.svg" width="18" height="18" /></button>
                <button onClick={() => handleChangeTool(ToolsType.TRIANGLE_FRAME)} data-ui={selectedTool === ToolsType.TRIANGLE_FRAME ? "active" : ""} className="w-8 h-8 data-active:bg-slate-300 rounded-lg flex items-center justify-center"><img src="/triangle-frame.svg" width="18" height="18" /></button>
                <button onClick={() => handleChangeTool(ToolsType.TRIANGLE)} data-ui={selectedTool === ToolsType.TRIANGLE ? "active" : ""} className="w-8 h-8 data-active:bg-slate-300 rounded-lg flex items-center justify-center"><img src="/triangle.svg" width="18" height="18" /></button>
                <button onClick={() => handleChangeTool(ToolsType.LINE)} data-ui={selectedTool === ToolsType.LINE ? "active" : ""} className="w-8 h-8 data-active:bg-slate-300 rounded-lg flex items-center justify-center"><img src="/line.svg" width="18" height="18" /></button>
                <button onClick={() => handleChangeTool(ToolsType.PEN)} data-ui={selectedTool === ToolsType.PEN ? "active" : ""} className="w-8 h-8 data-active:bg-slate-300 rounded-lg flex items-center justify-center"><img src="/pen.svg" width="18" height="18" /></button>
                {selectedTool === ToolsType.PEN && <select
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg h-8 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-300 dark:text-white"
                    value={selectedWidthPen}
                    onChange={handleChangeWidthPen}
                >
                    {Object.values(WidthsPen).map((widthPen) => {
                        return <option key={widthPen} value={widthPen}>{widthPen}</option>;
                    })}
                </select>}
            </div>
            <div data-ui={(selectedTool !== ToolsType.RESIZE && selectedTool !== ToolsType.MOVE) ? "active" : ""} className="border-solid border-black-700 border-2 p-3 flex gap-5 flex-row items-center opacity-30 data-active:opacity-100">
                <div data-ui={selectedColor === ColorsType.BLACK ? "active" : ""} className="h-8 w-8 bg-black data-active:border-solid data-active:border-orange-500 data-active:border-2" onClick={() => handleChangeColor(ColorsType.BLACK)}></div>
                <div data-ui={selectedColor === ColorsType.RED ? "active" : ""} className="h-8 w-8 bg-red-500 data-active:border-solid data-active:border-orange-500 data-active:border-2" onClick={() => handleChangeColor(ColorsType.RED)}></div>
                <div data-ui={selectedColor === ColorsType.YELLOW ? "active" : ""} className="h-8 w-8 bg-yellow-200 data-active:border-solid data-active:border-orange-500 data-active:border-2" onClick={() => handleChangeColor(ColorsType.YELLOW)}></div>
                <div data-ui={selectedColor === ColorsType.GREEN ? "active" : ""} className="h-8 w-8 bg-green-600 data-active:border-solid data-active:border-orange-500 data-active:border-2" onClick={() => handleChangeColor(ColorsType.GREEN)}></div>
                <div data-ui={selectedColor === ColorsType.BLUE ? "active" : ""} className="h-8 w-8 bg-blue-700 data-active:border-solid data-active:border-orange-500 data-active:border-2" onClick={() => handleChangeColor(ColorsType.BLUE)}></div>
            </div>
            <div className="border-solid border-black-700 border-2 p-3 flex gap-5 flex-row items-center hover:bg-slate-300" onClick={handleClickDownload}>
                <img src="/download.svg" width="30" height="30" />
            </div>
            <button
                className="h-10 text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none"
                onClick={handleClickRemoveAll}
            >
                Remove All
            </button>
            <a ref={downloadRef} download="image.png"></a>
        </div>
    );
}
