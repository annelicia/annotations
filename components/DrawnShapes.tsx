import { Dispatch, MutableRefObject, SetStateAction } from "react";
import { ToolsType } from "../constants/Enums";
import { Annotation } from "./ImageWithTools";
import styles from "./DrawnShapes.module.css";

interface DrawnShapesProps {
    annotations: Annotation[];
    selectedAnnotationTmp: number | undefined;
    selectedAnnotation: number | undefined;
    setSelectedAnnotation: Dispatch<SetStateAction<number | undefined>>;
    selectedTool: ToolsType;
    contextCanvasRef: MutableRefObject<CanvasRenderingContext2D | undefined>;
}

export default function DrawnShapes({ annotations, selectedAnnotationTmp, selectedAnnotation, setSelectedAnnotation, selectedTool, contextCanvasRef }: DrawnShapesProps) {
    const isEditTool = selectedTool === ToolsType.RESIZE || selectedTool === ToolsType.MOVE || selectedTool === ToolsType.SELECT;
    return (
        <>
            {annotations.map((annotation, i) => {
                if (annotation.type === ToolsType.PEN) {
                    let img = new Image();
                    img.onload = () => {
                        if (contextCanvasRef.current) {
                            contextCanvasRef.current.drawImage(img, 0, 0);
                        }
                    }
                    img.src = annotation.dataUrl;
                    return null;
                } else if (annotation.type === ToolsType.TEXT) {
                    const { x1, y1, color, text } = annotation;
                    return <text
                        key={i}
                        className={styles.text}
                        x={x1}
                        y={y1}
                        fill={color}
                        stroke={selectedAnnotation === i && selectedTool === ToolsType.SELECT ? "orange" : "none"}
                        onMouseDown={() => {
                            if (isEditTool) {
                                setSelectedAnnotation(i);
                                selectedAnnotationTmp = i;
                            }
                        }}
                    >
                        {text}
                    </text>;
                } else {
                    const { type, x1, y1, x2, y2, color } = annotation;
                    if (type === ToolsType.CIRCLE_FRAME) {
                        if (selectedAnnotation === i && selectedTool === ToolsType.SELECT) {
                            return <g key={i}>
                                <circle
                                    cx={((x1 + x2) / 2)}
                                    cy={((y1 + y2) / 2)}
                                    r={Math.max(Math.abs(((x2 - x1) / 2)), Math.abs(((y2 - y1) / 2)))}
                                    fill="none"
                                    stroke="orange"
                                    strokeWidth={10}

                                />
                                <circle
                                    cx={(x1 + x2) / 2}
                                    cy={(y1 + y2) / 2}
                                    r={Math.max(Math.abs((x2 - x1) / 2), Math.abs((y2 - y1) / 2))}
                                    fill="none"
                                    stroke={color}
                                    strokeWidth={5}

                                />
                            </g>;
                        } else {
                            return <circle
                                key={i}
                                cx={(x1 + x2) / 2}
                                cy={(y1 + y2) / 2}
                                r={Math.max(Math.abs((x2 - x1) / 2), Math.abs((y2 - y1) / 2))}
                                fill="none"
                                stroke={color}
                                strokeWidth={5}
                                onMouseDown={() => {
                                    if (isEditTool) {
                                        setSelectedAnnotation(i);
                                        selectedAnnotationTmp = i;
                                    }
                                }}
                            />;
                        }
                    } else if (type === ToolsType.CIRCLE) {
                        return <circle
                            key={i}
                            cx={(x1 + x2) / 2}
                            cy={(y1 + y2) / 2}
                            r={Math.max(Math.abs((x2 - x1) / 2), Math.abs((y2 - y1) / 2))}
                            fill={color}
                            stroke={selectedAnnotation === i && selectedTool === ToolsType.SELECT ? "orange" : "none"}
                            strokeWidth={3}
                            onMouseDown={() => {
                                if (isEditTool) {
                                    setSelectedAnnotation(i);
                                    selectedAnnotationTmp = i;
                                }
                            }}
                        />;
                    } else if (type === ToolsType.RECT_FRAME) {
                        if (selectedAnnotation === i && selectedTool === ToolsType.SELECT) {
                            return <g key={i}>
                                <rect
                                    x={x2 < x1 ? x2 : x1}
                                    y={y2 < y1 ? y2 : y1}
                                    width={Math.abs(x2 - x1)}
                                    height={Math.abs(y2 - y1)}
                                    fill="none"
                                    stroke="orange"
                                    strokeWidth={10}
                                />
                                <rect
                                    x={x2 < x1 ? x2 : x1}
                                    y={y2 < y1 ? y2 : y1}
                                    width={Math.abs(x2 - x1)}
                                    height={Math.abs(y2 - y1)}
                                    fill="none"
                                    stroke={color}
                                    strokeWidth={5}
                                />
                            </g>;
                        } else {
                            return <rect
                                key={i}
                                x={x2 < x1 ? x2 : x1}
                                y={y2 < y1 ? y2 : y1}
                                width={Math.abs(x2 - x1)}
                                height={Math.abs(y2 - y1)}
                                fill="none"
                                stroke={color}
                                strokeWidth={5}
                                onMouseDown={() => {
                                    if (isEditTool) {
                                        setSelectedAnnotation(i);
                                        selectedAnnotationTmp = i;
                                    }
                                }}
                            />;
                        }
                    } else if (type === ToolsType.RECT) {
                        return <rect
                            key={i}
                            x={x2 < x1 ? x2 : x1}
                            y={y2 < y1 ? y2 : y1}
                            width={Math.abs(x2 - x1)}
                            height={Math.abs(y2 - y1)}
                            fill={color}
                            stroke={selectedAnnotation === i && selectedTool === ToolsType.SELECT ? "orange" : "none"}
                            strokeWidth={3}
                            onMouseDown={() => {
                                if (isEditTool) {
                                    setSelectedAnnotation(i);
                                    selectedAnnotationTmp = i;
                                }
                            }}
                        />
                    } else if (type === ToolsType.TRIANGLE_FRAME) {
                        if (selectedAnnotation === i && selectedTool === ToolsType.SELECT) {
                            return <g key={i}>
                                <polygon
                                    points={`${(x1 + x2) / 2} ${y1}, ${x1} ${y2}, ${x2} ${y2}`}
                                    fill="none"
                                    stroke="orange"
                                    strokeWidth={10}
                                />
                                <polygon
                                    points={`${(x1 + x2) / 2} ${y1}, ${x1} ${y2}, ${x2} ${y2}`}
                                    fill="none"
                                    stroke={color}
                                    strokeWidth={5}
                                />
                            </g>;
                        } else {
                            return <polygon
                                key={i}
                                points={`${(x1 + x2) / 2} ${y1}, ${x1} ${y2}, ${x2} ${y2}`}
                                fill="none"
                                stroke={color}
                                strokeWidth={5}
                                onMouseDown={() => {
                                    if (isEditTool) {
                                        setSelectedAnnotation(i);
                                        selectedAnnotationTmp = i;
                                    }
                                }}
                            />;
                        }
                    } else if (type === ToolsType.TRIANGLE) {
                        return <polygon
                            key={i}
                            points={`${(x1 + x2) / 2} ${y1}, ${x1} ${y2}, ${x2} ${y2}`}
                            fill={color}
                            stroke={selectedAnnotation === i && selectedTool === ToolsType.SELECT ? "orange" : "none"}
                            strokeWidth={3}
                            onMouseDown={() => {
                                if (isEditTool) {
                                    setSelectedAnnotation(i);
                                    selectedAnnotationTmp = i;
                                }
                            }}
                        />;
                    } else if (type === ToolsType.LINE) {
                        if (selectedAnnotation === i && selectedTool === ToolsType.SELECT) {
                            return <g key={i}>
                                <line
                                    x1={x1}
                                    y1={y1}
                                    x2={x2}
                                    y2={y2}
                                    stroke="orange"
                                    strokeWidth="15"
                                />
                                <line
                                    x1={x1}
                                    y1={y1}
                                    x2={x2}
                                    y2={y2}
                                    stroke={color}
                                    strokeWidth="10"
                                />
                            </g>;
                        } else {
                            return <line
                                key={i}
                                x1={x1}
                                y1={y1}
                                x2={x2}
                                y2={y2}
                                stroke={color}
                                strokeWidth="10"
                                onMouseDown={() => {
                                    if (isEditTool) {
                                        setSelectedAnnotation(i);
                                        selectedAnnotationTmp = i;
                                    }
                                }}
                            />;
                        }
                    }
                }
            })}
        </>
    );
}
