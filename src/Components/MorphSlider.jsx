import { useEffect, useRef, useState, useCallback } from 'react';
import { Renderer, Triangle, Program, Mesh, Texture } from 'ogl';
import { gsap } from 'gsap';

const TRANSITIONS = { melt: 0, ripple: 1, shear: 2, swirl: 3 };

const DEFAULT_ITEMS = [
    { image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=1600&auto=format&fit=crop', caption: 'Maktab' },
    { image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1600&auto=format&fit=crop', caption: "Ta'lim" },
    { image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=1600&auto=format&fit=crop', caption: 'Darslar' },
    { image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1600&auto=format&fit=crop', caption: 'Sport' },
];

const vertexShader = `attribute vec2 position;attribute vec2 uv;varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,0.0,1.0);}`;

const fragmentShader = `precision highp float;
uniform sampler2D tCurrent;uniform sampler2D tNext;uniform vec2 uResolution;uniform vec2 uCurrentSize;uniform vec2 uNextSize;
uniform float uProgress;uniform float uDir;uniform int uMode;uniform float uIntensity;uniform float uScale;
uniform float uAberration;uniform float uDrift;uniform float uTime;uniform float uReduce;uniform vec2 uPointer;uniform vec3 uOverlay;
varying vec2 vUv;const float PI=3.14159265359;
float hash11(float p){p=fract(p*0.1031);p*=p+33.33;p*=p+p;return fract(p);}
float hash21(vec2 p){vec3 p3=fract(vec3(p.xyx)*0.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}
float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);vec2 u=f*f*(3.0-2.0*f);float a=hash21(i);float b=hash21(i+vec2(1.0,0.0));float c=hash21(i+vec2(0.0,1.0));float d=hash21(i+vec2(1.0,1.0));return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);}
float fbm(vec2 p){float v=0.0;float a=0.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.0;a*=0.5;}return v;}
mat2 rot(float a){float s=sin(a);float c=cos(a);return mat2(c,-s,s,c);}
vec2 coverUV(vec2 uv,vec2 res,vec2 img){float rA=res.x/max(res.y,1.0);float iA=img.x/max(img.y,1.0);vec2 s=vec2(1.0);float ratio=rA/max(iA,0.0001);if(ratio>1.0){s.y=1.0/ratio;}else{s.x=ratio;}return(uv-0.5)*s+0.5;}
void main(){float p=clamp(uProgress,0.0,1.0);float env=sin(p*PI);vec2 uv=vUv;
uv+=vec2(sin(uTime*0.25+uv.y*4.0),cos(uTime*0.22+uv.x*4.0))*uDrift*0.008;
uv=(uv-0.5)*(1.0-uDrift*0.02*sin(uTime*0.4))+0.5;
vec2 uvC=uv;vec2 uvN=uv;float m=smoothstep(0.0,1.0,p);
if(uReduce<0.5){if(uMode==3){vec2 c=uv-0.5;float r=length(c);float ang=env*uIntensity*3.5*(1.0-r);uvC=rot(ang)*c+0.5;uvN=rot(-ang)*c+0.5;m=smoothstep(0.0,1.0,p);}
else if(uMode==1){float d=distance(uv,uPointer);float ring=p*1.6;float wave=sin((d-ring)*30.0)*env;vec2 dir=normalize(uv-uPointer+1e-4);vec2 disp=dir*wave*uIntensity*0.25;uvC=uv+disp;uvN=uv+disp*0.6;m=1.0-smoothstep(ring-0.03,ring+0.03,d);}
else if(uMode==2){float slices=14.0;float row=floor(uv.y*slices);float rnd=hash11(row);vec2 disp=vec2((rnd-0.5)*env*uIntensity*0.6,0.0);uvC=uv+disp;uvN=uv+disp;float localX=uDir>0.0?uv.x:1.0-uv.x;float th=p*1.5-0.25+(rnd-0.5)*0.25;m=1.0-smoothstep(th-0.06,th+0.06,localX);}
else{float nn=fbm(uv*uScale+uTime*0.03);float warp=fbm(uv*uScale*1.7-uTime*0.02);vec2 g=vec2(nn,warp)-0.5;uvC=uv+g*uIntensity*0.5*p;uvN=uv-g*uIntensity*0.5*(1.0-p);m=smoothstep(nn-0.15,nn+0.15,p);}}
vec2 sC=coverUV(uvC,uResolution,uCurrentSize);vec2 sN=coverUV(uvN,uResolution,uNextSize);
float ca=uReduce<0.5?uAberration*env*0.03:0.0;
vec3 colC=vec3(texture2D(tCurrent,sC+vec2(ca,0.0)).r,texture2D(tCurrent,sC).g,texture2D(tCurrent,sC-vec2(ca,0.0)).b);
vec3 colN=vec3(texture2D(tNext,sN+vec2(ca,0.0)).r,texture2D(tNext,sN).g,texture2D(tNext,sN-vec2(ca,0.0)).b);
vec3 col=mix(colC,colN,m);float vig=smoothstep(1.25,0.25,length(uv-0.5));
col=mix(col,uOverlay,(1.0-vig)*0.28);gl_FragColor=vec4(col,1.0);}`;

function makeFallback(gl) {
    const d = new Uint8Array(64); for (let i = 0; i < 16; i++) { d[i*4]=24; d[i*4+1]=24; d[i*4+2]=28; d[i*4+3]=255; }
    return new Texture(gl, { image: d, width: 4, height: 4, generateMipmaps: false });
}
function hexRgb(hex) {
    let h = (hex||'#000').replace('#',''); if (h.length===3) h=h.split('').map(c=>c+c).join('');
    const n=parseInt(h,16); return [((n>>16)&255)/255,((n>>8)&255)/255,(n&255)/255];
}

class Engine {
    constructor(el, { items, startIndex, reduced, getOpts, onIdx, dpr }) {
        this.el=el; this.items=items; this.getOpts=getOpts; this.onIdx=onIdx; this.reduced=reduced;
        this.cur=startIndex; this.animating=false; this.dragging=false; this.dragDir=0;
        this.shown=startIndex; this.tween=null;
        this.renderer=new Renderer({ alpha:false, antialias:true, dpr:Math.min(window.devicePixelRatio||1,dpr) });
        this.gl=this.renderer.gl; this.gl.clearColor(0.05,0.05,0.06,1);
        this.canvas=this.gl.canvas; this.canvas.className='block w-full h-full';
        el.appendChild(this.canvas);
        this.geo=new Triangle(this.gl);
        this.tex=items.map(()=>makeFallback(this.gl));
        this.sizes=items.map(()=>[1,1]);
        const o=getOpts();
        this.prog=new Program(this.gl,{ vertex:vertexShader, fragment:fragmentShader, uniforms:{
            tCurrent:{value:this.tex[this.cur]}, tNext:{value:this.tex[this.cur]},
            uResolution:{value:[1,1]}, uCurrentSize:{value:this.sizes[this.cur]}, uNextSize:{value:this.sizes[this.cur]},
            uProgress:{value:0}, uDir:{value:1}, uMode:{value:TRANSITIONS[o.transition]??0},
            uIntensity:{value:o.intensity}, uScale:{value:o.scale}, uAberration:{value:o.aberration},
            uDrift:{value:o.drift}, uTime:{value:0}, uReduce:{value:reduced?1:0},
            uPointer:{value:[0.5,0.5]}, uOverlay:{value:hexRgb(o.overlay)},
        }});
        this.mesh=new Mesh(this.gl,{ geometry:this.geo, program:this.prog });
        this._onLost=this._ctxLost.bind(this);
        this.canvas.addEventListener('webglcontextlost',this._onLost,false);
        this.ro=new ResizeObserver(()=>this._resize()); this.ro.observe(el);
        this._resize(); this._load(); this._loop=this._tick.bind(this);
        this.raf=requestAnimationFrame(this._loop);
    }
    _load() { this.items.forEach((item,i)=>{ const img=new Image(); img.crossOrigin='anonymous'; img.src=item.image; img.onload=()=>{ const t=new Texture(this.gl,{generateMipmaps:false}); t.image=img; this.tex[i]=t; this.sizes[i]=[img.naturalWidth||1,img.naturalHeight||1]; if(i===this.cur){this.prog.uniforms.tCurrent.value=t; this.prog.uniforms.uCurrentSize.value=this.sizes[i];} }; img.onerror=()=>{}; }); }
    _resize() { const r=this.el.getBoundingClientRect(); this.renderer.setSize(Math.max(r.width,1),Math.max(r.height,1)); this.prog.uniforms.uResolution.value=[this.gl.canvas.width,this.gl.canvas.height]; }
    _sync() { const o=this.getOpts(); this.prog.uniforms.uMode.value=TRANSITIONS[o.transition]??0; this.prog.uniforms.uIntensity.value=o.intensity; this.prog.uniforms.uScale.value=o.scale; this.prog.uniforms.uAberration.value=o.aberration; this.prog.uniforms.uDrift.value=o.drift; this.prog.uniforms.uOverlay.value=hexRgb(o.overlay); }
    _tick(t) { this.prog.uniforms.uTime.value=t*0.001; if(!this.dragging&&!this.animating)this._sync(); this.renderer.render({scene:this.mesh}); this.raf=requestAnimationFrame(this._loop); }
    _wrap(i) { const n=this.items.length; return((i%n)+n)%n; }
    _prep(dir) { const tgt=this._wrap(this.cur+dir); this.prog.uniforms.tCurrent.value=this.tex[this.cur]; this.prog.uniforms.uCurrentSize.value=this.sizes[this.cur]; this.prog.uniforms.tNext.value=this.tex[tgt]; this.prog.uniforms.uNextSize.value=this.sizes[tgt]; this.prog.uniforms.uDir.value=dir; return tgt; }
    _announce(i) { if(i===this.shown)return; this.shown=i; if(this.onIdx)this.onIdx(i); }
    _commit(tgt) { this.cur=tgt; this.prog.uniforms.tCurrent.value=this.tex[tgt]; this.prog.uniforms.uCurrentSize.value=this.sizes[tgt]; this.prog.uniforms.uProgress.value=0; this.animating=false; this.tween=null; this._announce(tgt); }
    goTo(dir) {
        if(this.animating||this.dragging||this.items.length<2)return;
        const o=this.getOpts();
        if(!o.loop){const r=this.cur+dir; if(r<0||r>this.items.length-1)return;}
        this._sync(); const tgt=this._prep(dir); this.animating=true; this._announce(tgt);
        const dur=this.reduced?Math.min(o.duration,0.4):o.duration;
        this.tween=gsap.fromTo(this.prog.uniforms.uProgress,{value:0},{value:1,duration:dur,ease:o.ease,onComplete:()=>this._commit(tgt)});
    }
    next() { this.goTo(1); } prev() { this.goTo(-1); }
    setPtr(x,y) { this.prog.uniforms.uPointer.value=[x,y]; }
    beginDrag() { if(this.animating||this.items.length<2)return false; this.dragging=true; this.dragDir=0; this._sync(); return true; }
    drag(ndx) { if(!this.dragging)return; const o=this.getOpts(); const dir=ndx<0?1:-1; if(!o.loop){const r=this.cur+dir; if(r<0||r>this.items.length-1){this.prog.uniforms.uProgress.value=0;return;}} if(dir!==this.dragDir){this.dragDir=dir;this._prep(dir);} const prog=Math.min(Math.abs(ndx),1); this.prog.uniforms.uProgress.value=prog; this._announce(prog>0.5?this._wrap(this.cur+dir):this.cur); }
    endDrag() { if(!this.dragging)return; this.dragging=false; const p=this.prog.uniforms.uProgress.value; if(this.dragDir===0)return; const tgt=this._wrap(this.cur+this.dragDir); const dur=this.reduced?0.3:0.5; this.animating=true; if(p>0.4){this._announce(tgt);this.tween=gsap.to(this.prog.uniforms.uProgress,{value:1,duration:dur,ease:'power2.out',onComplete:()=>this._commit(tgt)});}else{this._announce(this.cur);this.tween=gsap.to(this.prog.uniforms.uProgress,{value:0,duration:dur,ease:'power2.out',onComplete:()=>{this.animating=false;this.tween=null;}});} }
    _ctxLost(e) { e.preventDefault(); cancelAnimationFrame(this.raf); }
    destroy() { cancelAnimationFrame(this.raf); if(this.tween)this.tween.kill(); this.ro.disconnect(); this.canvas.removeEventListener('webglcontextlost',this._onLost); this.tex.forEach(t=>{if(t?.texture)this.gl.deleteTexture(t.texture);}); if(this.prog?.program)this.gl.deleteProgram(this.prog.program); const ext=this.gl.getExtension('WEBGL_lose_context'); if(ext)ext.loseContext(); if(this.canvas.parentNode)this.canvas.parentNode.removeChild(this.canvas); }
}

export default function MorphSlider({
    items=DEFAULT_ITEMS, startIndex=0, transition='melt', duration=1.1,
    ease='power2.inOut', intensity=0.55, scale=2.4, aberration=0.35, drift=0.4,
    autoplay=false, autoplayDelay=4, loop=true, radius=16, overlayColor='#000000',
    showCaptions=true, showControls=true, showIndicators=true, className='', ...props
}) {
    const elRef=useRef(null), engRef=useRef(null);
    const [idx,setIdx]=useState(startIndex), [hover,setHover]=useState(false);
    const optsRef=useRef(); optsRef.current={transition,duration,ease,intensity,scale,aberration,drift,overlay:overlayColor,loop};

    useEffect(()=>{
        if(!elRef.current)return;
        const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const eng=new Engine(elRef.current,{items,startIndex,reduced,dpr:2,getOpts:()=>optsRef.current,onIdx:setIdx});
        engRef.current=eng; setIdx(startIndex);
        return()=>{ eng.destroy(); engRef.current=null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[items,startIndex]);

    const next=useCallback(()=>engRef.current?.next(),[]);
    const prev=useCallback(()=>engRef.current?.prev(),[]);

    useEffect(()=>{
        if(!autoplay||hover)return;
        const id=setTimeout(()=>engRef.current?.next(),Math.max(autoplayDelay,1)*1000);
        return()=>clearTimeout(id);
    },[autoplay,autoplayDelay,hover,idx]);

    useEffect(()=>{
        const el=elRef.current; if(!el)return;
        let sx=0,w=1,active=false;
        const dn=e=>{const r=el.getBoundingClientRect();w=r.width||1;sx=e.clientX;engRef.current?.setPtr((e.clientX-r.left)/r.width,1-(e.clientY-r.top)/r.height);active=engRef.current?.beginDrag()??false;if(active&&el.setPointerCapture)try{el.setPointerCapture(e.pointerId);}catch{}};
        const mv=e=>{if(!active)return;engRef.current?.drag((e.clientX-sx)/w);};
        const up=()=>{if(!active)return;active=false;engRef.current?.endDrag();};
        el.addEventListener('pointerdown',dn); el.addEventListener('pointermove',mv); el.addEventListener('pointerup',up); el.addEventListener('pointercancel',up);
        return()=>{el.removeEventListener('pointerdown',dn);el.removeEventListener('pointermove',mv);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);};
    },[]);

    const onKey=useCallback(e=>{if(e.key==='ArrowRight'){e.preventDefault();next();}else if(e.key==='ArrowLeft'){e.preventDefault();prev();}},[next,prev]);
    const hasCap=items.some(i=>i.caption);

    return (
        <div className={`relative w-full h-full overflow-hidden select-none bg-[#0c0c0e] ${className}`.trim()}
            style={{ borderRadius:`${radius}px`, '--ms-swap':`${(duration*0.66).toFixed(3)}s`, '--ms-dot':`${(duration*0.45).toFixed(3)}s`, touchAction:'pan-y' }}
            onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)} {...props}>
            <div ref={elRef} className="absolute inset-0 cursor-grab active:cursor-grabbing outline-none"
                role="group" aria-roledescription="carousel" aria-label="Image morph slider"
                tabIndex={0} onKeyDown={onKey} />
            {showCaptions&&hasCap&&(
                <div className="morph-slider-caption pointer-events-none absolute bottom-[22px] left-[22px] z-[2] grid max-w-[70%]" aria-live="polite">
                    {items.map((item,i)=>item.caption?(
                        <span key={i} aria-hidden={i===idx?undefined:true}
                            className={`pointer-events-none inline-block rounded-[10px] bg-[rgba(10,10,12,0.42)] px-[14px] py-[8px] text-[15px] font-semibold tracking-[0.01em] text-white backdrop-blur-[8px] [grid-area:1/1] [justify-self:start] [transition:opacity_var(--ms-swap)_cubic-bezier(0.16,1,0.3,1),transform_var(--ms-swap)_cubic-bezier(0.16,1,0.3,1),filter_var(--ms-swap)_cubic-bezier(0.16,1,0.3,1)] ${i===idx?'opacity-100 [transform:translateY(0)] [filter:blur(0)]':'opacity-0 [transform:translateY(12px)] [filter:blur(6px)]'}`}>
                            {item.caption}
                        </span>
                    ):null)}
                </div>
            )}
            {showControls&&(
                <div className="absolute top-1/2 left-0 right-0 z-[3] flex justify-between px-4 -translate-y-1/2 pointer-events-none">
                    <button type="button" aria-label="Previous slide" onClick={prev}
                        className="pointer-events-auto inline-flex items-center justify-center w-10 h-10 rounded-full text-white border border-white/20 bg-[rgba(12,12,14,0.4)] backdrop-blur-md cursor-pointer transition-transform duration-200 hover:scale-105 hover:bg-[rgba(24,24,28,0.6)] active:scale-95">
                        <svg viewBox="0 0 24 24" width="18" height="18"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <button type="button" aria-label="Next slide" onClick={next}
                        className="pointer-events-auto inline-flex items-center justify-center w-10 h-10 rounded-full text-white border border-white/20 bg-[rgba(12,12,14,0.4)] backdrop-blur-md cursor-pointer transition-transform duration-200 hover:scale-105 hover:bg-[rgba(24,24,28,0.6)] active:scale-95">
                        <svg viewBox="0 0 24 24" width="18" height="18"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                </div>
            )}
            {showIndicators&&(
                <div className="absolute left-0 right-0 bottom-[18px] z-[3] flex gap-2 justify-center" role="tablist">
                    {items.map((_,i)=>(
                        <button key={i} type="button" role="tab" aria-selected={i===idx} aria-label={`Slide ${i+1}`}
                            className={`h-2 rounded-full cursor-pointer [transition:width_var(--ms-dot)_cubic-bezier(0.16,1,0.3,1),background-color_var(--ms-dot)_ease] ${i===idx?'w-[22px] bg-white/95':'w-2 bg-white/35'}`}
                            onClick={()=>{ const e=engRef.current; if(!e||i===idx)return; e.goTo(i>idx?1:-1); }} />
                    ))}
                </div>
            )}
        </div>
    );
}
