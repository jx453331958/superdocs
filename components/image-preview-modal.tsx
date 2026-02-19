'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import { CloseOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useIsMobile } from '@/components/hooks/use-breakpoint';

interface ImagePreviewModalProps {
  images: string[];
  visible: boolean;
  initialIndex?: number;
  onClose: () => void;
}

/**
 * 全屏图片预览组件 - 原生触摸滑动，替代 antd Image.PreviewGroup
 */
export function ImagePreviewModal({ images, visible, initialIndex = 0, onClose }: ImagePreviewModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(initialIndex);
  const isMobile = useIsMobile();

  // 当 visible 或 initialIndex 变化时，滚动到指定位置
  useEffect(() => {
    if (visible && scrollRef.current) {
      // 用 requestAnimationFrame 确保 DOM 已渲染
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ left: initialIndex * window.innerWidth, behavior: 'instant' });
      });
      setCurrent(initialIndex);
    }
  }, [visible, initialIndex]);

  // 键盘导航
  useEffect(() => {
    if (!visible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goTo(current - 1);
      if (e.key === 'ArrowRight') goTo(current + 1);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [visible, current]);

  // 锁定 body 滚动
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [visible]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !el.clientWidth) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setCurrent(Math.max(0, Math.min(index, images.length - 1)));
  }, [images.length]);

  const goTo = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, images.length - 1));
    scrollRef.current?.scrollTo({ left: clamped * window.innerWidth, behavior: 'smooth' });
  }, [images.length]);

  if (!visible || images.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 顶部栏：页码 + 关闭 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        color: '#fff',
        fontSize: 14,
        zIndex: 2,
      }}>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
          {images.length > 1 ? `${current + 1} / ${images.length}` : ''}
        </span>
        <div
          onClick={onClose}
          style={{
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
          }}
        >
          <CloseOutlined style={{ fontSize: 18 }} />
        </div>
      </div>

      {/* 图片滚动区 */}
      <div
        ref={scrollRef}
        className="image-preview-scroll"
        onScroll={handleScroll}
        style={{
          flex: 1,
          display: 'flex',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
        }}
      >
        {images.map((url, idx) => (
          <div
            key={idx}
            onClick={onClose}
            style={{
              flex: '0 0 100vw',
              width: '100vw',
              height: '100%',
              scrollSnapAlign: 'start',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: isMobile ? '0 8px' : '0 48px',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt=""
              onClick={(e) => e.stopPropagation()}
              draggable={false}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: 4,
                userSelect: 'none',
              }}
            />
          </div>
        ))}
      </div>

      {/* PC 端左右箭头 */}
      {!isMobile && images.length > 1 && (
        <>
          {current > 0 && (
            <div
              onClick={() => goTo(current - 1)}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 44,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 18,
                zIndex: 2,
              }}
            >
              <LeftOutlined />
            </div>
          )}
          {current < images.length - 1 && (
            <div
              onClick={() => goTo(current + 1)}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 44,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 18,
                zIndex: 2,
              }}
            >
              <RightOutlined />
            </div>
          )}
        </>
      )}
    </div>
  );
}
