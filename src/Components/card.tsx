"use client";

import React, {
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
  ReactNode,
  CSSProperties,
} from "react";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const settings = {
  snapBackDuration: 300,
  maxTilt: 5,
  bouncePower: 0.2,
  swipeThreshold: 300,
};

type Vector = { x: number; y: number };
type Speed = Vector;
type Location = Vector & { time: number };
type Direction = "left" | "right" | "up" | "down";

const getElementSize = (element: HTMLElement): Vector => {
  const elementStyles = window.getComputedStyle(element);
  const width = parseFloat(elementStyles.width);
  const height = parseFloat(elementStyles.height);
  return { x: width, y: height };
};

const pythagoras = (x: number, y: number): number => Math.sqrt(x ** 2 + y ** 2);

const translationString = (x: number, y: number): string =>
  `translate(${x}px, ${y}px)`;

const rotationString = (rot: number): string => `rotate(${rot}deg)`;

const getTranslate = (element: HTMLElement): Vector => {
  const style = window.getComputedStyle(element);
  const matrix = new DOMMatrixReadOnly(style.transform);
  return { x: matrix.m41, y: matrix.m42 };
};

const getRotation = (element: HTMLElement): number => {
  const style = window.getComputedStyle(element);
  const matrix = new DOMMatrixReadOnly(style.transform);
  return (-Math.asin(matrix.b) / (2 * Math.PI)) * 360;
};

const calcSpeed = (oldLoc: Location, newLoc: Location): Speed => {
  const dx = newLoc.x - oldLoc.x;
  const dy = oldLoc.y - newLoc.y;
  const dt = (newLoc.time - oldLoc.time) / 1000;
  return { x: dx / dt, y: dy / dt };
};

const getSwipeDirection = (speed: Speed): Direction => {
  return Math.abs(speed.x) > Math.abs(speed.y)
    ? speed.x > 0
      ? "right"
      : "left"
    : speed.y > 0
    ? "up"
    : "down";
};

const animateOut = async (
  element: HTMLElement,
  speed: Speed,
  easeIn = false
) => {
  const startPos = getTranslate(element);
  const bodySize = getElementSize(document.body);
  const diagonal = pythagoras(bodySize.x, bodySize.y);
  const velocity = pythagoras(speed.x, speed.y);
  const time = diagonal / velocity;
  const multiplier = diagonal / velocity;

  const translateStr = translationString(
    speed.x * multiplier + startPos.x,
    -speed.y * multiplier + startPos.y
  );

  let rotateStr = "";
  const rotationPower = 200;
  const rotation = getRotation(element);

  if (easeIn) {
    element.style.transition = `ease ${time}s`;
  } else {
    element.style.transition = `ease-out ${time}s`;
  }

  if (rotation === 0) {
    rotateStr = rotationString((Math.random() - 0.5) * rotationPower);
  } else if (rotation > 0) {
    rotateStr = rotationString(Math.random() * (rotationPower / 2) + rotation);
  } else {
    rotateStr = rotationString(
      (Math.random() - 1) * (rotationPower / 2) + rotation
    );
  }

  element.style.transform = translateStr + rotateStr;
  await sleep(time * 1000);
};

const animateBack = (element: HTMLElement) => {
  element.style.transition = `${settings.snapBackDuration}ms`;
  const start = getTranslate(element);
  const translation = translationString(
    -start.x * settings.bouncePower,
    -start.y * settings.bouncePower
  );
  const rotation = rotationString(getRotation(element) * -settings.bouncePower);
  element.style.transform = translation + rotation;

  setTimeout(() => {
    element.style.transform = "none";
  }, settings.snapBackDuration * 0.75);

  setTimeout(() => {
    element.style.transition = "10ms";
  }, settings.snapBackDuration);
};

const dragableTouchmove = (
  coords: Vector,
  element: HTMLElement,
  offset: Vector,
  lastLoc: Location
): Location => {
  const pos = { x: coords.x + offset.x, y: coords.y + offset.y };
  const newLoc = { x: pos.x, y: pos.y, time: new Date().getTime() };
  const translation = translationString(pos.x, pos.y);
  const rotCalc = calcSpeed(lastLoc, newLoc).x / 1000;
  const rotation = rotationString(rotCalc * settings.maxTilt);
  element.style.transform = translation + rotation;
  return newLoc;
};

const touchCoordinatesFromEvent = (e: TouchEvent): Vector => {
  const touch = e.targetTouches[0];
  return { x: touch.clientX, y: touch.clientY };
};

const mouseCoordinatesFromEvent = (e: MouseEvent): Vector => {
  return { x: e.clientX, y: e.clientY };
};

interface TinderCardProps {
  flickOnSwipe?: boolean;
  onSwipe?: (dir: Direction) => void;
  onCardLeftScreen?: (dir: Direction) => void;
  preventSwipe?: Direction[];
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export interface TinderCardRef {
  swipe: (dir?: Direction) => Promise<void>;
}

const TinderCard = forwardRef<TinderCardRef, TinderCardProps>(
  (
    {
      flickOnSwipe = true,
      children,
      onSwipe,
      onCardLeftScreen,
      className,
      style,
      preventSwipe = [],
    },
    parentRef
  ) => {
    const swipeAlreadyReleased = useRef(false);
    let elementGlobal: HTMLElement;

    useImperativeHandle(parentRef, () => ({
      async swipe(dir = "right") {
        onSwipe?.(dir);
        const power = 1000;
        const disturbance = (Math.random() - 0.5) * 100;
        const speed =
          dir === "right"
            ? { x: power, y: disturbance }
            : dir === "left"
            ? { x: -power, y: disturbance }
            : dir === "up"
            ? { x: disturbance, y: power }
            : { x: disturbance, y: -power };

        await animateOut(elementGlobal, speed, true);
        elementGlobal.style.display = "none";
        onCardLeftScreen?.(dir);
      },
    }));

    const handleSwipeReleased = useCallback(
      async (element: HTMLElement, speed: Speed) => {
        if (swipeAlreadyReleased.current) return;
        swipeAlreadyReleased.current = true;

        if (
          Math.abs(speed.x) > settings.swipeThreshold ||
          Math.abs(speed.y) > settings.swipeThreshold
        ) {
          const dir = getSwipeDirection(speed);
          onSwipe?.(dir);

          if (flickOnSwipe && !preventSwipe.includes(dir)) {
            await animateOut(element, speed);
            element.style.display = "none";
            onCardLeftScreen?.(dir);
            return;
          }
        }

        animateBack(element);
      },
      [flickOnSwipe, onSwipe, onCardLeftScreen, preventSwipe]
    );

    const handleSwipeStart = useCallback(() => {
      swipeAlreadyReleased.current = false;
    }, []);

    const ref = useCallback(
      (element: HTMLElement | null) => {
        if (!element) return;
        elementGlobal = element;

        let offset: Vector = { x: 0, y: 0 };
        let speed: Speed = { x: 0, y: 0 };
        let lastLocation: Location = {
          x: 0,
          y: 0,
          time: new Date().getTime(),
        };
        let mouseIsClicked = false;

        element.addEventListener("touchstart", (ev) => {
          ev.preventDefault();
          handleSwipeStart();
          offset = {
            x: -touchCoordinatesFromEvent(ev).x,
            y: -touchCoordinatesFromEvent(ev).y,
          };
        });

        element.addEventListener("mousedown", (ev) => {
          ev.preventDefault();
          mouseIsClicked = true;
          handleSwipeStart();
          offset = {
            x: -mouseCoordinatesFromEvent(ev).x,
            y: -mouseCoordinatesFromEvent(ev).y,
          };
        });

        element.addEventListener("touchmove", (ev) => {
          ev.preventDefault();
          const newLoc = dragableTouchmove(
            touchCoordinatesFromEvent(ev),
            element,
            offset,
            lastLocation
          );
          speed = calcSpeed(lastLocation, newLoc);
          lastLocation = newLoc;
        });

        element.addEventListener("mousemove", (ev) => {
          if (mouseIsClicked) {
            ev.preventDefault();
            const newLoc = dragableTouchmove(
              mouseCoordinatesFromEvent(ev),
              element,
              offset,
              lastLocation
            );
            speed = calcSpeed(lastLocation, newLoc);
            lastLocation = newLoc;
          }
        });

        element.addEventListener("touchend", (ev) => {
          ev.preventDefault();
          handleSwipeReleased(element, speed);
        });

        element.addEventListener("mouseup", (ev) => {
          if (mouseIsClicked) {
            ev.preventDefault();
            mouseIsClicked = false;
            handleSwipeReleased(element, speed);
          }
        });

        element.addEventListener("mouseleave", (ev) => {
          if (mouseIsClicked) {
            ev.preventDefault();
            mouseIsClicked = false;
            handleSwipeReleased(element, speed);
          }
        });
      },
      [handleSwipeReleased, handleSwipeStart]
    );

    TinderCard.displayName = "TinderCard";

    return (
      <div ref={ref} style={style} className={className}>
        {children}
      </div>
    );
  }
);

export default TinderCard;
