import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import styles from './styles.module.css';

const MIN_SPEED = 0.5;
const MAX_SPEED = 2;
const BLOB_COUNT = 8;

const randomNumber = (min: number, max: number): number =>
  Math.random() * (max - min) + min;

type BlobStateType = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  initialX: number;
  initialY: number;
};

type BlobRefType = {
  initBlob: () => void;
  updateBlobPosition: () => void;
};

const Blob = forwardRef<BlobRefType>((_, ref) => {
  const blobRef = useRef<HTMLDivElement>(null);
  const blobStateRef = useRef<BlobStateType | null>(null);

  function initBlob() {
    if (!blobRef.current) {
      return;
    }

    blobRef.current.classList.add(styles.blob);
    const boundingRect = blobRef.current.getBoundingClientRect();
    const size = boundingRect.width;

    // 隨機初始位置
    const initialX = randomNumber(0, window.innerWidth - size);
    const initialY = randomNumber(0, window.innerHeight - size);

    // 初始化 DOM 位置
    blobRef.current.style.top = `${initialY}px`;
    blobRef.current.style.left = `${initialX}px`;

    // 速度
    const vx =
      randomNumber(MIN_SPEED, MAX_SPEED) * (Math.random() > 0.5 ? 1 : -1);
    const vy =
      randomNumber(MIN_SPEED, MAX_SPEED) * (Math.random() > 0.5 ? 1 : -1);

    blobStateRef.current = {
      x: initialX,
      y: initialY,
      vx,
      vy,
      size,
      initialX,
      initialY,
    };
  }

  function updateBlobPosition() {
    if (!blobStateRef.current || !blobRef.current) {
      return;
    }

    const state = blobStateRef.current;

    // 更新位置
    state.x += state.vx;
    state.y += state.vy;

    // 邊界檢測與反彈 - 優化後的邏輯
    if (state.x >= window.innerWidth - state.size || state.x <= 0) {
      state.vx *= -1;
      state.x = Math.max(0, Math.min(state.x, window.innerWidth - state.size));
    }
    if (state.y >= window.innerHeight - state.size || state.y <= 0) {
      state.vy *= -1;
      state.y = Math.max(0, Math.min(state.y, window.innerHeight - state.size));
    }

    // 直接更新 DOM，避免重新渲染
    blobRef.current.style.transform = `translate(${state.x - state.initialX}px, ${state.y - state.initialY}px)`;
  }

  // 暴露內部方法
  useImperativeHandle(ref, () => ({
    initBlob,
    updateBlobPosition,
  }));

  // 初始化泡泡位置
  useEffect(() => {
    initBlob();
  }, []);

  return <div ref={blobRef} />;
});

Blob.displayName = 'Blob';

export default function Blobs() {
  const blobRefs = useRef<(BlobRefType | null)[]>(
    Array.from({ length: BLOB_COUNT }, () => null)
  );
  const animationRef = useRef<number | null>(null);
  const isRunning = useRef(false);

  // 初始化動畫
  useEffect(() => {
    isRunning.current = true;

    function update() {
      if (!isRunning.current) {
        return;
      }

      blobRefs.current.forEach((blob) => {
        blob?.updateBlobPosition();
      });

      animationRef.current = requestAnimationFrame(update);
    }

    animationRef.current = requestAnimationFrame(update);

    return () => {
      isRunning.current = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // window size 改變時重新初始化所有泡泡位置
  useEffect(() => {
    function handleResize() {
      blobRefs.current.forEach((blob) => {
        if (blob) {
          blob.initBlob();
        }
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={styles.blobs} data-testid="blobs-container">
      {Array.from({ length: BLOB_COUNT }, (_, index) => (
        <Blob
          key={index}
          ref={(el) => {
            blobRefs.current[index] = el;
          }}
        />
      ))}
    </div>
  );
}
