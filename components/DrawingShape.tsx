import { ColorsType, ToolsType } from "../constants/Enums";
import { Point } from "./ImageWithTools";

interface DrawingShapeProps {
    startPoint: Point | undefined;
    endPoint: Point | undefined;
    selectedTool: ToolsType;
    selectedColor: ColorsType;
}

export default function DrawingShape({ startPoint, endPoint, selectedTool, selectedColor }: DrawingShapeProps) {
    return (
        <>
            {startPoint &&
                endPoint &&
                selectedTool === ToolsType.CIRCLE_FRAME &&
                <circle
                    cx={(startPoint.x + endPoint.x) / 2}
                    cy={(startPoint.y + endPoint.y) / 2}
                    r={Math.max(Math.abs((endPoint.x - startPoint.x) / 2), Math.abs((endPoint.y - startPoint.y) / 2))}
                    stroke={selectedColor}
                    strokeWidth={5}
                    fill="none"
                />}
            {startPoint &&
                endPoint &&
                selectedTool === ToolsType.CIRCLE &&
                <circle
                    cx={(startPoint.x + endPoint.x) / 2}
                    cy={(startPoint.y + endPoint.y) / 2}
                    r={Math.max(Math.abs((endPoint.x - startPoint.x) / 2), Math.abs((endPoint.y - startPoint.y) / 2))}
                    fill={selectedColor}
                />}
            {startPoint &&
                endPoint &&
                selectedTool === ToolsType.RECT_FRAME &&
                <rect
                    x={endPoint.x < startPoint.x ? endPoint.x : startPoint.x}
                    y={endPoint.y < startPoint.y ? endPoint.y : startPoint.y}
                    width={Math.abs(endPoint.x - startPoint.x)}
                    height={Math.abs(endPoint.y - startPoint.y)}
                    stroke={selectedColor}
                    strokeWidth={5}
                    fill="none"
                />}
            {startPoint &&
                endPoint &&
                selectedTool === ToolsType.RECT &&
                <rect
                    x={endPoint.x < startPoint.x ? endPoint.x : startPoint.x}
                    y={endPoint.y < startPoint.y ? endPoint.y : startPoint.y}
                    width={Math.abs(endPoint.x - startPoint.x)}
                    height={Math.abs(endPoint.y - startPoint.y)}
                    fill={selectedColor}
                />}
            {startPoint &&
                endPoint &&
                selectedTool === ToolsType.TRIANGLE_FRAME &&
                <polygon
                    points={`${(startPoint.x + endPoint.x) / 2} ${startPoint.y}, ${startPoint.x} ${endPoint.y}, ${endPoint.x} ${endPoint.y}`}
                    stroke={selectedColor}
                    strokeWidth={5}
                    fill="none"
                />}
            {startPoint &&
                endPoint &&
                selectedTool === ToolsType.TRIANGLE &&
                <polygon
                    points={`${(startPoint.x + endPoint.x) / 2} ${startPoint.y}, ${startPoint.x} ${endPoint.y}, ${endPoint.x} ${endPoint.y}`}
                    fill={selectedColor}
                />}
            {startPoint &&
                endPoint &&
                selectedTool === ToolsType.LINE &&
                <line
                    x1={startPoint.x}
                    y1={startPoint.y}
                    x2={endPoint.x}
                    y2={endPoint.y}
                    stroke={selectedColor}
                    strokeWidth="10"
                />}
        </>
    );
}
