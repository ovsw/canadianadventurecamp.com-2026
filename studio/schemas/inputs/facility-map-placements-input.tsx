import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import { Box, Button, Card, Flex, Stack, Text } from "@sanity/ui";
import { curveCatmullRom, curveLinear, line } from "d3-shape";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  PatchEvent,
  set,
  type ArrayOfObjectsInputProps,
  useClient,
  useFormValue,
} from "sanity";

type FacilityReference = {
  _ref?: string;
  _type?: "reference";
};

type PlacementValue = {
  _key: string;
  _type?: "facilityMapPlacement";
  facility?: FacilityReference;
  labelPosition?: "above" | "auto" | "below" | "left" | "right";
  prominent?: boolean;
  x?: number;
  y?: number;
};

type MapImageValue = {
  asset?: { _ref?: string; _type?: "reference" };
};

type DragState = {
  key: string;
  moved: boolean;
  pointerId: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
};

const clampPercentage = (value: number) =>
  Math.min(100, Math.max(0, Number(value.toFixed(2))));

const MAP_TRANSLATE_X = -30.77;
const MAP_ZOOM = 1.5385;

function labelTransform(position: PlacementValue["labelPosition"]) {
  switch (position) {
    case "below":
      return "translate(-50%, 16px)";
    case "left":
      return "translate(calc(-100% - 16px), -50%)";
    case "right":
      return "translate(16px, -50%)";
    case "above":
    case "auto":
    default:
      return "translate(-50%, calc(-100% - 16px))";
  }
}

function createPath(placements: PlacementValue[]) {
  const points = placements.filter(
    (placement): placement is PlacementValue & { x: number; y: number } =>
      typeof placement.x === "number" && typeof placement.y === "number",
  );
  if (points.length < 2) return undefined;

  return (
    line<(typeof points)[number]>()
      .x(({ x }) => x)
      .y(({ y }) => y)
      .curve(
        points.length < 3 ? curveLinear : curveCatmullRom.alpha(0.5),
      )(points) ?? undefined
  );
}

export default function FacilityMapPlacementsInput(
  props: ArrayOfObjectsInputProps<PlacementValue>,
) {
  const client = useClient({ apiVersion: "2026-03-23" });
  const mapImage = useFormValue(["mapImage"]) as MapImageValue | undefined;
  const mapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | undefined>(undefined);
  const draggedRef = useRef(false);
  const [dragState, setDragState] = useState<DragState>();
  const [facilityNames, setFacilityNames] = useState<Record<string, string>>({});
  const [previewRunning, setPreviewRunning] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const placements = props.value ?? [];
  const referenceIds = useMemo(
    () =>
      Array.from(
        new Set(
          placements.flatMap((placement) =>
            placement.facility?._ref ? [placement.facility._ref] : [],
          ),
        ),
      ),
    [placements],
  );
  const referenceIdsKey = referenceIds.join("|");

  useEffect(() => {
    let cancelled = false;
    if (!referenceIds.length) {
      setFacilityNames({});
      return;
    }

    void client
      .fetch<Array<{ _id: string; name?: string }>>(
        `*[_type == "facility" && _id in $ids]{_id, name}`,
        { ids: referenceIds },
      )
      .then((facilities) => {
        if (cancelled) return;
        setFacilityNames(
          Object.fromEntries(
            facilities.map((facility) => [
              facility._id,
              facility.name || "Untitled Facility",
            ]),
          ),
        );
      });

    return () => {
      cancelled = true;
    };
  }, [client, referenceIdsKey]);

  useEffect(() => {
    if (!previewRunning || placements.length < 2) return;
    const timer = window.setInterval(() => {
      setPreviewIndex((current) => (current + 1) % placements.length);
    }, 2400);
    return () => window.clearInterval(timer);
  }, [placements.length, previewRunning]);

  useEffect(() => {
    setPreviewIndex((current) =>
      placements.length ? Math.min(current, placements.length - 1) : 0,
    );
  }, [placements.length]);

  const mapUrl = useMemo(() => {
    if (!mapImage?.asset?._ref) return undefined;
    return createImageUrlBuilder(client)
      .image(mapImage as SanityImageSource)
      .width(1400)
      .fit("max")
      .url();
  }, [client, mapImage]);
  const displayedPlacements = placements.map((placement) =>
    dragState?.key === placement._key
      ? { ...placement, x: dragState.x, y: dragState.y }
      : placement,
  );
  const editorPlacements = displayedPlacements.map((placement) => ({
    ...placement,
    x:
      typeof placement.x === "number"
        ? MAP_TRANSLATE_X + placement.x * MAP_ZOOM
        : placement.x,
    y:
      typeof placement.y === "number"
        ? placement.y * MAP_ZOOM
        : placement.y,
  }));
  const pathData = createPath(editorPlacements);

  const updateDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    const current = dragRef.current;
    const mapBounds = mapRef.current?.getBoundingClientRect();
    if (!current || !mapBounds || event.pointerId !== current.pointerId) return;

    const moved =
      current.moved ||
      Math.hypot(event.clientX - current.startX, event.clientY - current.startY) >
        3;
    const outerX = ((event.clientX - mapBounds.left) / mapBounds.width) * 100;
    const outerY = ((event.clientY - mapBounds.top) / mapBounds.height) * 100;
    const next = {
      ...current,
      moved,
      x: clampPercentage((outerX - MAP_TRANSLATE_X) / MAP_ZOOM),
      y: clampPercentage(outerY / MAP_ZOOM),
    };
    dragRef.current = next;
    setDragState(next);
    if (moved) setPreviewRunning(false);
  };

  const finishDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    const current = dragRef.current;
    if (!current || event.pointerId !== current.pointerId) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    dragRef.current = undefined;
    setDragState(undefined);
    draggedRef.current = current.moved;

    if (current.moved) {
      props.onChange(
        PatchEvent.from([
          set(current.x, [{ _key: current.key }, "x"]),
          set(current.y, [{ _key: current.key }, "y"]),
        ]),
      );
    }
  };

  const cancelDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = undefined;
    draggedRef.current = false;
    setDragState(undefined);
  };

  return (
    <Stack space={4}>
      <Card border padding={3} radius={2}>
        <Stack space={3}>
          <Flex align="center" justify="space-between" gap={3}>
            <Box>
              <Text size={1} weight="semibold">
                Map editor
              </Text>
              <Text muted size={1}>
                Drag markers to position them. Click a marker to edit it.
              </Text>
            </Box>
            <Button
              disabled={placements.length < 2}
              mode="ghost"
              onClick={() => setPreviewRunning((running) => !running)}
              text={previewRunning ? "Pause preview" : "Play preview"}
              type="button"
            />
          </Flex>

          {mapUrl ? (
            <Box
              ref={mapRef}
              style={{
                background: "#16200f",
                borderRadius: 3,
                aspectRatio: "1320 / 766",
                overflow: "hidden",
                position: "relative",
                touchAction: "none",
              }}
            >
              <div
                style={{
                  inset: 0,
                  position: "absolute",
                  transform: `translate(${MAP_TRANSLATE_X}%, 0) scale(${MAP_ZOOM})`,
                  transformOrigin: "0 0",
                }}
              >
                <img
                  alt="Facilities Map editor preview"
                  draggable={false}
                  src={mapUrl}
                  style={{ height: "100%", objectFit: "cover", position: "absolute", width: "100%" }}
                />
              </div>

              {pathData ? (
                <svg
                  aria-hidden="true"
                  preserveAspectRatio="none"
                  style={{ height: "100%", inset: 0, position: "absolute", width: "100%" }}
                  viewBox="0 0 100 100"
                >
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#e5a934"
                    strokeDasharray="4 4"
                    strokeLinecap="round"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              ) : null}

              {displayedPlacements.map((placement, index) => {
                if (typeof placement.x !== "number" || typeof placement.y !== "number") {
                  return null;
                }
                const placementX = placement.x;
                const placementY = placement.y;
                const editorX = MAP_TRANSLATE_X + placementX * MAP_ZOOM;
                const editorY = placementY * MAP_ZOOM;
                const referenceId = placement.facility?._ref;
                const name = referenceId
                  ? facilityNames[referenceId] || "Facility"
                  : "Choose a Facility";
                const active = previewRunning && index === previewIndex;

                return (
                  <div
                    key={placement._key}
                    style={{
                      left: `${editorX}%`,
                      pointerEvents: "none",
                      position: "absolute",
                      top: `${editorY}%`,
                    }}
                  >
                    <span
                      style={{
                        background: "rgba(0,0,0,.86)",
                        color: "white",
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: ".06em",
                        padding: "3px 5px",
                        position: "absolute",
                        textTransform: "uppercase",
                        transform: labelTransform(placement.labelPosition),
                        whiteSpace: "nowrap",
                      }}
                    >
                      {name}
                    </span>
                    <button
                      aria-label={`Position ${name}`}
                      onClick={() => {
                        if (draggedRef.current) {
                          draggedRef.current = false;
                          return;
                        }
                        props.onItemOpen([{ _key: placement._key }]);
                      }}
                      onPointerCancel={cancelDrag}
                      onPointerDown={(event) => {
                        event.currentTarget.setPointerCapture(event.pointerId);
                        draggedRef.current = false;
                        const next = {
                          key: placement._key,
                          moved: false,
                          pointerId: event.pointerId,
                          startX: event.clientX,
                          startY: event.clientY,
                          x: placementX,
                          y: placementY,
                        };
                        dragRef.current = next;
                        setDragState(next);
                      }}
                      onPointerMove={updateDrag}
                      onPointerUp={finishDrag}
                      style={{
                        background: active ? "#e5a934" : "#111",
                        border: active ? "3px solid white" : "2px solid white",
                        boxShadow: active ? "0 0 0 2px #111" : "none",
                        cursor: dragState?.key === placement._key ? "grabbing" : "grab",
                        height: placement.prominent ? 22 : 18,
                        left: 0,
                        padding: 0,
                        pointerEvents: "auto",
                        position: "absolute",
                        top: 0,
                        transform: "translate(-50%, -50%) rotate(45deg)",
                        width: placement.prominent ? 22 : 18,
                      }}
                      type="button"
                    />
                  </div>
                );
              })}
            </Box>
          ) : (
            <Card border padding={4} radius={2} tone="caution">
              <Text size={1}>Add the map image to position Facilities.</Text>
            </Card>
          )}
        </Stack>
      </Card>

      {props.renderDefault(props)}
    </Stack>
  );
}
