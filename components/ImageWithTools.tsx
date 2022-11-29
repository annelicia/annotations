import { MouseEvent, useEffect, useRef, useState } from "react";
import { ColorsType, ToolsType, WidthsPen } from "../constants/Enums";
import OptionTools from "./OptionTools";
import styles from "./ImageWithTools.module.css";
import DrawnShapes from "./DrawnShapes";
import DrawingShape from "./DrawingShape";

interface ImageWithToolsProps {
    chosenImg: string;
}

interface Shape {
    type: ToolsType.CIRCLE_FRAME | ToolsType.CIRCLE | ToolsType.RECT_FRAME | ToolsType.RECT | ToolsType.TRIANGLE_FRAME | ToolsType.TRIANGLE | ToolsType.LINE;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    color: ColorsType;
}

interface Text {
    type: ToolsType.TEXT;
    x1: number;
    y1: number;
    color: ColorsType;
    text: string;
}

interface Pen {
    type: ToolsType.PEN;
    dataUrl: string;
}

export type Annotation = (Shape | Text | Pen);

export interface Point {
    x: number;
    y: number;
}

export interface ImageSize {
    width: number;
    height: number;
}

export default function ImageWithTools({ chosenImg }: ImageWithToolsProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextCanvasRef = useRef<CanvasRenderingContext2D>();
    const [imageSize, setImageSize] = useState<ImageSize>({ width: 0, height: 0 });
    const [startPoint, setStartPoint] = useState<Point>();
    const [endPoint, setEndPoint] = useState<Point>();
    const [isDrawing, setIsDrawing] = useState(false);
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [selectedTool, setSelectedTool] = useState(ToolsType.RECT);
    const [selectedColor, setSelectedColor] = useState(ColorsType.BLACK);
    const [selectedWidthPen, setSelectedWidthPen] = useState(WidthsPen.SMALL);
    const [selectedAnnotation, setSelectedAnnotation] = useState<number | undefined>();
    let selectedAnnotationTmp: number | undefined = undefined;

    useEffect(() => {
        if (!canvasRef.current) return;
        const context = canvasRef.current.getContext("2d");
        if (!context) return;
        const lineWidth = selectedWidthPen === WidthsPen.SMALL ? 2 : (selectedWidthPen === WidthsPen.MEDIUM ? 6 : 10);
        context.lineWidth = Number(lineWidth);
        context.strokeStyle = selectedColor;
        context.lineCap = "round";
        contextCanvasRef.current = context;
    }, [canvasRef.current, selectedColor, selectedWidthPen]);

    useEffect(() => {
        if (selectedAnnotation === undefined) return;
        setAnnotations(prev => [...prev.map((annotation, i) => {
            if (selectedAnnotation === i) {
                return {
                    ...annotation,
                    color: selectedColor,
                }
            } else {
                return annotation;
            }
        })])
    }, [selectedColor]);

    const handleMouseDown = ({ nativeEvent }: MouseEvent) => {
        const { offsetX, offsetY } = nativeEvent;
        if (selectedTool === ToolsType.PEN) {
            const canvasRefCurrent = canvasRef.current;
            if (!contextCanvasRef.current || canvasRefCurrent === null) return;
            const tmp = canvasRefCurrent.toDataURL();
            setAnnotations(prev => [...prev, {
                type: ToolsType.PEN,
                dataUrl: tmp,
            }]);
            contextCanvasRef.current.beginPath();
            contextCanvasRef.current.lineTo(offsetX, offsetY);
            contextCanvasRef.current.moveTo(offsetX, offsetY);
            contextCanvasRef.current.stroke();
        } else if (selectedTool === ToolsType.RESIZE) {
            setAnnotations(prev => [...prev.map((annotation, i) => {
                if (i === selectedAnnotationTmp && annotation.type !== ToolsType.TEXT) {
                    return {
                        ...annotation,
                        x2: offsetX,
                        y2: offsetY,
                    };
                } else {
                    return annotation;
                }
            })]);
        } else {
            setStartPoint({
                x: offsetX,
                y: offsetY,
            });
            setEndPoint({
                x: offsetX,
                y: offsetY,
            });
        }
        setIsDrawing(true);
    }

    const handleMouseMove = ({ nativeEvent }: MouseEvent) => {
        const { offsetX, offsetY } = nativeEvent;
        if (selectedTool === ToolsType.PEN) {
            if (!contextCanvasRef.current || !isDrawing) return;
            contextCanvasRef.current.lineTo(offsetX, offsetY);
            contextCanvasRef.current.stroke();
        } else if (selectedTool === ToolsType.RESIZE) {
            setAnnotations(prev => [...prev.map((annotation, i) => {
                if (i === selectedAnnotation) {
                    return {
                        ...annotation,
                        x2: offsetX,
                        y2: offsetY,
                    };
                } else {
                    return annotation;
                }
            })]);
        } else if (selectedTool === ToolsType.MOVE) {
            if (!startPoint) return;
            setAnnotations(prev => [...prev.map((annotation, i) => {
                if (annotation.type === ToolsType.PEN) return annotation;
                if (selectedAnnotation === i) {
                    const distX = offsetX - startPoint.x;
                    const distY = offsetY - startPoint.y;
                    if (annotation.type === ToolsType.TEXT) {
                        return {
                            ...annotation,
                            x1: annotation.x1 + distX,
                            y1: annotation.y1 + distY,
                        }
                    } else {
                        return {
                            ...annotation,
                            x1: annotation.x1 + distX,
                            y1: annotation.y1 + distY,
                            x2: annotation.x2 + distX,
                            y2: annotation.y2 + distY,
                        }
                    }
                } else {
                    return annotation;
                }
            })]);
            setStartPoint({
                x: offsetX,
                y: offsetY,
            });
        } else {
            if (!isDrawing) return;
            setEndPoint({
                x: offsetX,
                y: offsetY,
            });
        }
    }

    const handleMouseUp = () => {
        if (selectedTool === ToolsType.PEN) {
            if (!contextCanvasRef.current || !isDrawing || !canvasRef.current) return;
            contextCanvasRef.current.closePath();
            contextCanvasRef.current.save();
        } else if (selectedTool === ToolsType.RESIZE || selectedTool === ToolsType.MOVE) {
            setSelectedAnnotation(undefined);
        } else if (selectedTool !== ToolsType.SELECT) {
            if (!isDrawing || !startPoint || !endPoint) return;
            if (selectedTool === ToolsType.TEXT) {
                const textInput = prompt("Input text: ") || "";
                if (textInput !== "") {
                    setAnnotations([...annotations, {
                        type: selectedTool,
                        x1: startPoint.x,
                        y1: startPoint.y,
                        color: selectedColor,
                        text: textInput,
                    }]);
                };
            } else if (!(startPoint.x === endPoint.x && startPoint.y === endPoint.y)) {
                setAnnotations([...annotations, {
                    type: selectedTool,
                    x1: startPoint.x,
                    y1: startPoint.y,
                    x2: endPoint.x,
                    y2: endPoint.y,
                    color: selectedColor,
                }]);
            };
        }
        setStartPoint(undefined);
        setEndPoint(undefined);
        setIsDrawing(false);
    }

    const handleMouseLeave = () => {
        if (selectedTool === ToolsType.PEN) {
            if (!contextCanvasRef.current || !isDrawing || !canvasRef.current) return;
            contextCanvasRef.current.closePath();
            contextCanvasRef.current.save();
        } else if (selectedTool === ToolsType.RESIZE || selectedTool === ToolsType.MOVE) {
            setSelectedAnnotation(undefined);
        } else if (selectedTool === ToolsType.SELECT) {

        } else {
            if (!isDrawing || !startPoint || !endPoint) return;
            if (selectedTool === ToolsType.TEXT) return;
            setAnnotations([...annotations, {
                type: selectedTool,
                x1: startPoint.x,
                y1: startPoint.y,
                x2: endPoint.x,
                y2: endPoint.y,
                color: selectedColor,
            }]);
        }
        setStartPoint(undefined);
        setEndPoint(undefined);
        setIsDrawing(false);
    }

    return (
        <div className={styles.homeContainer}>
            <OptionTools
                selectedTool={selectedTool}
                setSelectedTool={setSelectedTool}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
                annotations={annotations}
                setAnnotations={setAnnotations}
                selectedAnnotation={selectedAnnotation}
                setSelectedAnnotation={setSelectedAnnotation}
                contextCanvasRef={contextCanvasRef}
                selectedWidthPen={selectedWidthPen}
                setSelectedWidthPen={setSelectedWidthPen}
                imgRef={imgRef}
                svgRef={svgRef}
                canvasRef={canvasRef}
                imageSize={imageSize}
            />
            <img ref={imgRef} className={styles.image} src={chosenImg} onLoad={() => {
                if (!imgRef.current) return;
                const image = imgRef.current as HTMLImageElement;
                setImageSize({
                    width: image.width,
                    height: image.height
                });
            }} />
            <canvas
                ref={canvasRef}
                className={selectedTool === ToolsType.PEN ? styles.activeDrawPointer : styles.background}
                width={imageSize.width}
                height={imageSize.height}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
            />
            <svg
                xmlns="http://www.w3.org/2000/svg"
                ref={svgRef}
                className={selectedTool === ToolsType.PEN ? styles.background : (selectedTool === ToolsType.MOVE ? styles.activeMovePointer : styles.activeDrawPointer)}
                width={imageSize.width}
                height={imageSize.height}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
            >
                <>
                    <DrawingShape
                        startPoint={startPoint}
                        endPoint={endPoint}
                        selectedTool={selectedTool}
                        selectedColor={selectedColor}
                    />
                    <DrawnShapes
                        annotations={annotations}
                        selectedAnnotationTmp={selectedAnnotationTmp}
                        selectedAnnotation={selectedAnnotation}
                        setSelectedAnnotation={setSelectedAnnotation}
                        selectedTool={selectedTool}
                        contextCanvasRef={contextCanvasRef}
                    />
                </>
            </svg>
        </div>
    );
}
