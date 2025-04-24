// File: /Users/xshima/Projects/tercel/frontend/components/ui/infinity-effect.tsx
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { cn } from "@/lib/utils";

interface InfinityEffectProps {
  text?: string;
  particleCount?: number;
  className?: string;
}

interface Particle {
  curveProgress: number;
  curveSpeed: number; // Оригинальная скорость вращения
  lifeProgress: number;
  lifeSpeed: number;
  phase: number;
  thicknessOffset: number;
  size: number;
  color: string;
}

const InfinityEffect = ({
  text = "",
  particleCount = 600, // Увеличим немного для плотности
  className
}: InfinityEffectProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);
  const animationTimeRef = useRef(0);

  // Параметры взаимодействия (усиленные)
  const mouseEffectRadiusFactor = 0.3;
  const attractionRadiusFactor = 0.5;
  const attractStrength = 45; // Еще немного увеличим силу
  const deadZoneFactor = 0.03;
  const particleEnlargeFactor = 2.5; // И увеличение
  const particleBaseSize = 1.0;
  const particleRandomSize = 1.5;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const textElement = textRef.current;

    if (!canvas || !container || !textElement) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let mouseEffectRadius = canvas.width * mouseEffectRadiusFactor;
    let attractionRadius = canvas.width * attractionRadiusFactor;
    let deadZone = canvas.width * deadZoneFactor;

    // Настройка текста (без изменений)
    if (text) {
      textElement.innerHTML = "";
      for (const char of text) {
        const span = document.createElement("span");
        span.textContent = char === " " ? "\u00A0" : char; // Используем юникод пробела
        span.style.display = "inline-block";
        span.style.color = "var(--color-foreground)"; // Используем CSS переменную
        textElement.appendChild(span);
      }
    } else {
      textElement.style.display = 'none';
    }

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const size = Math.min(rect.width, rect.height);

      canvas.width = size;
      canvas.height = size;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;

      mouseEffectRadius = size * mouseEffectRadiusFactor;
      attractionRadius = size * attractionRadiusFactor;
      deadZone = size * deadZoneFactor;

      if (text) {
        const fontSize = Math.max(18, Math.floor(size / 16)); // Сделаем чуть меньше базовый
        textElement.style.fontSize = `${fontSize}px`;
        textElement.style.left = `${size / 2}px`;
        textElement.style.top = `${size / 2 - fontSize * 0.6}px`; // Поднимем чуть выше
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const TWO_PI = Math.PI * 2;
    const neutralPosition = { x: 9999, y: 9999 };
    // --- УБИРАЕМ LERP ---
    let mouse = { ...neutralPosition };
    // --------------------

    // Цвета для анимации (без изменений)
    const animationColors = [
      'hsla(0, 80%, 65%, 0.9)',
      'hsla(40, 90%, 60%, 0.95)',
      'hsla(60, 100%, 65%, 0.95)',
      'hsla(120, 90%, 55%, 0.95)',
      'hsla(200, 90%, 60%, 0.95)',
      'hsla(260, 85%, 65%, 0.95)',
      'hsla(0, 80%, 65%, 0.9)'
    ];

    const getAnimationColor = (time: number) => {
      const animationDuration = 12000;
      const normalizedTime = (time % animationDuration) / animationDuration;
      const numKeyframes = animationColors.length;
      const keyframeProgress = normalizedTime * (numKeyframes - 1);
      const keyframeIndex = Math.floor(keyframeProgress);
      return animationColors[keyframeIndex];
    };

    // Создание частиц (без изменений)
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        curveProgress: Math.random(),
        curveSpeed: 0.0001 + Math.random() * 0.0002, // Оригинальная скорость
        lifeProgress: Math.random(),
        lifeSpeed: 0.0008 + Math.random() * 0.0008, // Оригинальная скорость жизни
        phase: Math.random() * TWO_PI,
        thicknessOffset: (Math.random() - 0.5) * 20,
        size: (particleBaseSize + Math.random() * particleRandomSize),
        color: 'var(--color-foreground)' // Используем CSS переменную
      });
    }

    // --- ВОЗВРАЩАЕМ ПРЯМОЕ ПРИСВАИВАНИЕ ---
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const handleMouseLeave = () => {
      mouse = { ...neutralPosition };
    };
    // ---------------------------------------

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    // --- АДАПТИРУЕМ TOUCH ДЛЯ ПРЯМОГО ПРИСВАИВАНИЯ ---
    let isTouching = false;
    // Убираем pressStartTime, isPressActive, pressThreshold, checkLongPress - они были для lerp

    const handleTouchStart = (e: TouchEvent) => {
        e.preventDefault();
        isTouching = true;
        if (e.touches.length > 0) {
            const rect = canvas.getBoundingClientRect();
            mouse = {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
        }
    };

    const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        if (e.touches.length > 0) {
            const rect = canvas.getBoundingClientRect();
            mouse = {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
        }
    };

    const handleTouchEnd = () => {
        isTouching = false;
        // Плавно уводить не будем, просто сбросим позицию
        mouse = { ...neutralPosition };
    };
    // -----------------------------------------------

    container.addEventListener('touchstart', handleTouchStart, { passive: false } as EventListenerOptions);
    container.addEventListener('touchmove', handleTouchMove, { passive: false } as EventListenerOptions);
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('touchcancel', handleTouchEnd); // Добавим touchcancel

    // Формулы кривой и касательной (без изменений)
    const infinityCurve = (t: number) => {
      const a = canvas.width / 3.5; // Чуть уменьшим кривую
      const x = a * Math.cos(t);
      const y = a * Math.sin(t) * Math.cos(t);
      return { x: x + canvas.width / 2, y: y + canvas.height / 2 };
    };

    const tangentAt = (t: number) => {
      const a = canvas.width / 3.5;
      const dx = -a * Math.sin(t);
      const dy = a * (Math.cos(t)**2 - Math.sin(t)**2); // cos(2t) = cos^2(t) - sin^2(t)
      const length = Math.sqrt(dx*dx + dy*dy);
      return length > 0 ? { x: dx / length, y: dy / length } : { x: 1, y: 0 };
    };

    const distance = (p1: {x: number, y: number}, p2: {x: number, y: number}) => {
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      return Math.sqrt(dx*dx + dy*dy);
    };

    // Анимация
    let animationFrameId: number;
    let lastTime = 0;

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate);

      // --- ВОЗВРАЩАЕМ ОРИГИНАЛЬНЫЙ DELTATIME ---
      const deltaTime = lastTime ? (currentTime - lastTime) : 16; // Время в мс
      lastTime = currentTime;
      // ---------------------------------------

      animationTimeRef.current = currentTime;
      // Убираем checkLongPress

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        // --- ОБНОВЛЕНИЕ С ОРИГИНАЛЬНЫМ DELTATIME ---
        p.curveProgress += p.curveSpeed * deltaTime;
        if (p.curveProgress > 1) p.curveProgress -= 1;
        if (p.curveProgress < 0) p.curveProgress += 1;

        p.lifeProgress += p.lifeSpeed * deltaTime;
        if (p.lifeProgress > 1) p.lifeProgress -= 1;
        // ------------------------------------------

        const t = p.curveProgress * TWO_PI;
        const basePos = infinityCurve(t);

        const fluctAmplitude = canvas.width * 0.01;
        const fluctX = fluctAmplitude * Math.sin(p.phase + t);
        const fluctY = fluctAmplitude * Math.cos(p.phase + t);

        let pos = {
          x: basePos.x + fluctX,
          y: basePos.y + fluctY
        };

        const tangent = tangentAt(t);
        const perp = { x: -tangent.y, y: tangent.x };
        pos.x += perp.x * p.thicknessOffset;
        pos.y += perp.y * p.thicknessOffset;

        // Усиленное взаимодействие (без изменений в логике, но УБИРАЕМ deltaTime из силы)
        const distToMouse = distance(basePos, mouse);

        if (mouse.x !== neutralPosition.x && distToMouse < attractionRadius && distToMouse > deadZone) {
          const effectiveDist = Math.max(distToMouse, deadZone);
          const attractPower = Math.pow((attractionRadius - effectiveDist) / attractionRadius, 2);
          const dx = (mouse.x - basePos.x);
          const dy = (mouse.y - basePos.y);
          const length = Math.sqrt(dx*dx + dy*dy);

          if (length > 0) {
            const attractDir = { x: dx / length, y: dy / length };
            // --- УБИРАЕМ DELTATIME ИЗ СИЛЫ ---
            pos.x += attractDir.x * attractPower * attractStrength;
            pos.y += attractDir.y * attractPower * attractStrength;
            // ---------------------------------
          }
        }

        // Масштабирование и цвет (без изменений в логике)
        const scaleVal = Math.sin(Math.PI * p.lifeProgress);
        let finalSize = p.size * scaleVal;

        if (mouse.x !== neutralPosition.x && distToMouse < mouseEffectRadius) {
           const enlargeRatio = (mouseEffectRadius - distToMouse) / mouseEffectRadius;
           const enlargeFactor = 1 + particleEnlargeFactor * enlargeRatio;
           finalSize *= enlargeFactor;
           p.color = getAnimationColor(currentTime); // Оригинальная логика цвета
        } else {
           p.color = 'var(--color-foreground)'; // Стандартный цвет из CSS
        }

        finalSize = Math.max(0.1, finalSize);

        // Отрисовка
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, finalSize, 0, TWO_PI);
        // Используем CSS переменную для цвета по умолчанию
        ctx.fillStyle = p.color === 'var(--color-foreground)' ? getComputedStyle(canvas).getPropertyValue('--color-foreground').trim() || '#FFFFFF' : p.color;
        ctx.fill();
      });
    };

    animate(0);

    // Очистка (адаптирована)
    return () => {
      window.removeEventListener('resize', resize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd); // Добавим touchcancel
      cancelAnimationFrame(animationFrameId);
    };
    // Обновляем зависимости, убирая ненужные
  }, [text, particleCount, attractStrength, particleEnlargeFactor, mouseEffectRadiusFactor, attractionRadiusFactor, deadZoneFactor]);

  return (
    <div className={cn("w-full max-w-4xl mx-auto relative", className)}>
      <div
        ref={containerRef}
        className="w-full aspect-square relative"
        style={{ userSelect: 'none', touchAction: 'none' }}
      >
        <div
          ref={textRef}
          className="absolute font-bold italic pointer-events-none z-10"
          style={{
            transform: 'translate(-50%, -50%)',
            whiteSpace: 'nowrap'
          }}
        ></div>
        <canvas ref={canvasRef} className="w-full h-full"></canvas>
      </div>
    </div>
  );
};

export default InfinityEffect;