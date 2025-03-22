"use client";

import React, { useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";

interface InfinityEffectProps {
  text?: string;
  particleCount?: number;
  className?: string;
}

interface Particle {
  curveProgress: number;
  curveSpeed: number;
  lifeProgress: number;
  lifeSpeed: number;
  phase: number;
  thicknessOffset: number;
  size: number;
  color: string;
}

const InfinityEffect = ({ 
  text = "", 
  particleCount = 500,
  className 
}: InfinityEffectProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const textElement = textRef.current;
    
    if (!canvas || !container || !textElement) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Настройка текста, если он указан
    if (text) {
      textElement.innerHTML = "";
      for (const char of text) {
        const span = document.createElement("span");
        span.textContent = char;
        span.style.display = "inline-block";
        span.style.color = "#f5f5f5";
        textElement.appendChild(span);
      }
    } else {
      // Если текст не указан, скрываем элемент
      textElement.style.display = 'none';
    }
    
    // Настройка размеров канваса
    const resize = () => {
      const rect = container.getBoundingClientRect();
      const size = Math.min(rect.width, rect.height);
      
      canvas.width = size;
      canvas.height = size;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      
      // Размещение текста в центре, если он указан
      if (text) {
        const fontSize = Math.max(20, Math.floor(size / 15));
        textElement.style.fontSize = `${fontSize}px`;
        textElement.style.left = `${size / 2}px`;
        textElement.style.top = `${size / 2 - fontSize}px`;
      }
    };
    
    // Инициализация размеров
    resize();
    window.addEventListener('resize', resize);
    
    // Константы для анимации
    const TWO_PI = Math.PI * 2;
    
    // Настройки для влияния курсора
    const mouseEffectRadius = canvas.width * 0.2;
    const attractionRadius = canvas.width * 0.4;
    const attractStrength = 5;
    const deadZone = 20;
    
    // Нейтральная позиция курсора (вне экрана)
    const neutralPosition = { x: 9999, y: 9999 };
    let mouse = { ...neutralPosition };
    
    // Создание частиц с уменьшенной скоростью движения
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        curveProgress: Math.random(),
        // Значительно уменьшаем скорость движения частиц по кривой
        curveSpeed: 0.0001 + Math.random() * 0.0002,
        lifeProgress: Math.random(),
        // Также уменьшаем скорость жизненного цикла
        lifeSpeed: 0.0008 + Math.random() * 0.0008,
        phase: Math.random() * TWO_PI,
        thicknessOffset: (Math.random() - 0.5) * 20,
        size: (1.2 + Math.random() * 2.2) / 3, // Уменьшаем размер частиц в 3 раза
        color: '#ffffff'  // Белый цвет по умолчанию
      });
    }
    
    // Обработчики событий для мыши
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
    
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    
    // Обработчики событий для тачскрина
    let isTouching = false;
    let pressStartTime = 0;
    let isPressActive = false;
    
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      isTouching = true;
      pressStartTime = Date.now();
      
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
      isPressActive = false;
      mouse = { ...neutralPosition };
    };
    
    container.addEventListener('touchstart', handleTouchStart, { passive: false } as EventListenerOptions);
    container.addEventListener('touchmove', handleTouchMove, { passive: false } as EventListenerOptions);
    container.addEventListener('touchend', handleTouchEnd);
    
    // Проверка долгого нажатия
    const pressThreshold = 300;
    const checkLongPress = () => {
      if (isTouching && !isPressActive && Date.now() - pressStartTime >= pressThreshold) {
        isPressActive = true;
      }
      
      if (!isTouching) {
        isPressActive = false;
      }
    };
    
    // Формула кривой бесконечности
    const infinityCurve = (t: number) => {
      const a = canvas.width / 5;
      const x = a * Math.cos(t);
      const y = a * Math.sin(t) * Math.cos(t);
      return { x: x + canvas.width / 2, y: y + canvas.height / 2 };
    };
    
    // Формула касательной к кривой
    const tangentAt = (t: number) => {
      const a = canvas.width / 5;
      const dx = -a * Math.sin(t);
      const dy = a * Math.cos(2*t);
      const length = Math.sqrt(dx*dx + dy*dy);
      return { x: dx / length, y: dy / length };
    };
    
    // Расчет расстояния между точками
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
      
      const deltaTime = lastTime ? (currentTime - lastTime) : 16;
      lastTime = currentTime;
      
      // Проверка долгого нажатия для мобильных устройств
      checkLongPress();
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Обновление и отрисовка каждой частицы
      particles.forEach(p => {
        // Обновление прогресса по кривой
        p.curveProgress += p.curveSpeed * deltaTime;
        if (p.curveProgress > 1) p.curveProgress -= 1;
        
        // Обновление жизненного цикла
        p.lifeProgress += p.lifeSpeed * deltaTime;
        if (p.lifeProgress > 1) p.lifeProgress -= 1;
        
        // Расчет позиции на кривой
        const t = p.curveProgress * TWO_PI;
        const basePos = infinityCurve(t);
        
        // Добавление флуктуаций
        const fluctAmplitude = canvas.width * 0.01;
        const fluctX = fluctAmplitude * Math.sin(p.phase + t);
        const fluctY = fluctAmplitude * Math.cos(p.phase + t);
        
        let pos = {
          x: basePos.x + fluctX,
          y: basePos.y + fluctY
        };
        
        // Добавление смещения по толщине потока
        const tangent = tangentAt(t);
        const perp = { x: -tangent.y, y: tangent.x };
        pos.x += perp.x * p.thicknessOffset;
        pos.y += perp.y * p.thicknessOffset;
        
        // Влияние курсора
        const distToMouse = distance(basePos, mouse);
        
        if (distToMouse < attractionRadius && distToMouse > deadZone) {
          const effectiveDist = Math.max(distToMouse, deadZone);
          const attractForce = Math.pow((attractionRadius - effectiveDist) / attractionRadius, 2);
          
          const dx = (mouse.x - basePos.x);
          const dy = (mouse.y - basePos.y);
          const length = Math.sqrt(dx*dx + dy*dy);
          
          if (length > 0) {
            const attractDir = {
              x: dx / length,
              y: dy / length
            };
            
            pos.x += attractDir.x * attractForce * attractStrength;
            pos.y += attractDir.y * attractForce * attractStrength;
          }
        }
        
        // Масштабирование в зависимости от жизненного цикла
        const scaleVal = Math.sin(Math.PI * p.lifeProgress);
        let finalSize = p.size * scaleVal * 2;
        
        // Увеличение размера возле курсора и изменение цвета на желтый
        if (distToMouse < mouseEffectRadius) {
          const enlargeFactor = (1 + 3 * ((mouseEffectRadius - distToMouse) / mouseEffectRadius)) / 2; // Уменьшаем увеличение при наведении в 3 раза
          finalSize *= enlargeFactor;
          
          // Изменение цвета возле курсора на желтый
          p.color = '#FFFF00';
        } else {
          // Белый цвет по умолчанию
          p.color = '#FFFFFF';
        }
        
        // Отрисовка частицы
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, finalSize, 0, TWO_PI);
        ctx.fillStyle = p.color;
        ctx.fill();
      });
    };
    
    // Запуск анимации
    animate(0);
    
    // Очистка при размонтировании компонента
    return () => {
      window.removeEventListener('resize', resize);
      
      // Удаление обработчиков событий
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      
      // Остановка анимации
      cancelAnimationFrame(animationFrameId);
    };
  }, [text, particleCount]);
  
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