import React from "react";
import { SlideBlockRenderer } from "./SlideBlockRenderer";
import { WelcomeChat, ChatMessage } from "./WelcomeChat";
import { ContentSlide, ContentRow } from "./ContentSlide";
import { ContactSlide, ContactItem } from "./ContactSlide";
import { ImpressumSlide } from "./ImpressumSlide";
import { tinaField } from "tinacms/dist/react";

export interface SpatialData {
  x?: number;
  y?: number;
  z?: number;
  scale?: number;
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
}

export interface SlideData {
  slideId: string;
  title?: string;
  slideType?: string;
  spatial?: SpatialData;
  blocks?: any[];
  chatMessages?: ChatMessage[];
  contentRows?: ContentRow[];
  contactItems?: ContactItem[];
  body?: any;
}

interface SpatialCanvasProps {
  slides: SlideData[];
  activeId: string;
  onNavigateSlide: (id: string) => void;
}

export const SpatialCanvas: React.FC<SpatialCanvasProps> = ({
  slides,
  activeId,
  onNavigateSlide,
}) => {
  const activeSlide =
    slides.find((s) => s.slideId === activeId) || slides[0] || { slideId: "welcome" };

  const spatial = activeSlide.spatial || { x: 0, y: 0, z: 0, scale: 1 };

  // Original impress.js setup from daviddumont.de (windowScale = 1)
  const windowScale = 1;

  const stepScale = spatial.scale && spatial.scale > 0 ? spatial.scale : 1;
  const targetScale = windowScale / stepScale;

  const rx = -(spatial.rotateX || 0);
  const ry = -(spatial.rotateY || 0);
  const rz = -(spatial.rotateZ || 0);
  const tx = -(spatial.x || 0);
  const ty = -(spatial.y || 0);
  const tz = -(spatial.z || 0);

  // Exact impress.js root transform from original site
  const rootStyle: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transformOrigin: "0% 0%",
    transformStyle: "preserve-3d",
    transition: "all 1000ms ease-in-out",
    perspective: `${1000 / targetScale}px`,
    transform: `scale(${targetScale})`,
  };

  // Exact impress.js canvas transform from original site
  const canvasStyle: React.CSSProperties = {
    position: "absolute",
    top: "0px",
    left: "0px",
    transformOrigin: "0% 0%",
    transformStyle: "preserve-3d",
    transition: "all 1000ms ease-in-out",
    transform: `rotateZ(${rz}deg) rotateY(${ry}deg) rotateX(${rx}deg) translate3d(${tx}px, ${ty}px, ${tz}px)`,
  };

  return (
    <div id="impress-viewport">
      <div id="impress" style={rootStyle}>
        <div id="impress-canvas" style={canvasStyle}>
          {slides.map((slide) => {
            const s = slide.spatial || { x: 0, y: 0, z: 0, scale: 1 };
            const isActive = slide.slideId === activeId;

            // Exact original impress.js step transform: translate3d(x,y,z) translate(-50%, -50%)
            const stepStyle: React.CSSProperties = {
              position: "absolute",
              top: "0px",
              left: "0px",
              transformOrigin: "0% 0%",
              transformStyle: "preserve-3d",
              transform: `translate3d(${s.x || 0}px, ${s.y || 0}px, ${s.z || 0}px) translate(-50%, -50%) rotateX(${s.rotateX || 0}deg) rotateY(${s.rotateY || 0}deg) rotateZ(${s.rotateZ || 0}deg) scale(${s.scale || 1})`,
            };

            return (
              <div
                key={slide.slideId}
                id={slide.slideId}
                className={`step page ${isActive ? "active" : ""}`}
                style={stepStyle}
                data-tina-field={tinaField(slide, "spatial")}
              >
                {/* Render Modular Blocks if available */}
                {slide.blocks && slide.blocks.length > 0 ? (
                  slide.blocks.map((block: any, bIdx: number) => (
                    <SlideBlockRenderer
                      key={block.id || bIdx}
                      block={block}
                      slideTitle={slide.title}
                      onNavigateSlide={onNavigateSlide}
                    />
                  ))
                ) : (
                  /* Fallback to legacy slideType */
                  <>
                    {slide.slideType === "welcome_chat" && (
                      <WelcomeChat
                        messages={slide.chatMessages || []}
                        onNavigateSlide={onNavigateSlide}
                      />
                    )}

                    {slide.slideType === "content_blocks" && (
                      <ContentSlide
                        title={slide.title || ""}
                        rows={slide.contentRows || []}
                      />
                    )}

                    {slide.slideType === "contact_info" && (
                      <ContactSlide
                        title={slide.title}
                        items={slide.contactItems || []}
                      />
                    )}

                    {slide.slideType === "legal_impressum" && (
                      <ImpressumSlide title={slide.title} body={slide.body} />
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
