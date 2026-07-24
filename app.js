
document.documentElement.classList.add('js');
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── header ── */
const hd=document.querySelector('.site-head');
addEventListener('scroll',function(){hd.classList.toggle('sc',scrollY>10)},{passive:true});

/* ── スクロール連動演出(進捗バー/パララックス/円紋回転/背景視差) ── */
const prog=document.getElementById('prog');
const decos=Array.from(document.querySelectorAll('.deco'));
const chapDecos=Array.from(document.querySelectorAll('.chap-deco'));
if(!RM){
  let tick=false;
  function fx(){
    tick=false;
    if(prog){
      const max=document.documentElement.scrollHeight-innerHeight;
      prog.style.width=(max>0?(scrollY/max)*100:0)+'%';
    }
    /* 浮遊デコ:深度別にわずかに速度差(CSSのtranslateプロパティなのでrotateと干渉しない) */
    for(let i=0;i<decos.length;i++){
      const el=decos[i];
      const r=el.getBoundingClientRect();
      if(r.bottom<-100||r.top>innerHeight+100)continue;
      const f=0.05+(i%3)*0.035;
      const d=(r.top+r.height/2-innerHeight/2)*f;
      el.style.translate='0 '+d.toFixed(1)+'px';
    }
    /* 章背景の円紋:スクロール量でゆっくり回転 */
    for(const el of chapDecos){
      const r=el.getBoundingClientRect();
      if(r.bottom<0||r.top>innerHeight)continue;
      el.style.rotate=((innerHeight-r.top)*0.02).toFixed(2)+'deg';
    }
    /* 紙のドット背景をわずかに遅らせて奥行きを出す */
    document.body.style.backgroundPositionY=(scrollY*0.25).toFixed(1)+'px';
  }
  addEventListener('scroll',function(){
    if(!tick){tick=true;requestAnimationFrame(fx)}
  },{passive:true});
  fx();
}else if(prog){
  addEventListener('scroll',function(){
    const max=document.documentElement.scrollHeight-innerHeight;
    prog.style.width=(max>0?(scrollY/max)*100:0)+'%';
  },{passive:true});
}

/* ── opening(理牌 → ロゴ)初回のみ・タップスキップ ── */
const opv=document.getElementById('opv');
if(opv&&document.documentElement.classList.contains('op-show')&&!RM){
  document.body.style.overflow='hidden';
  let ended=false;
  const done=function(){
    if(ended)return;ended=true;
    opv.classList.add('end');document.body.style.overflow='';
    try{sessionStorage.setItem('jr_op','1')}catch(e){}
  };
  opv.addEventListener('click',done);
  setTimeout(done,2100);
}else if(opv){opv.classList.add('end');document.body.style.overflow=''}

/* ── scroll reveal ── */
const io=new IntersectionObserver(function(es){
  for(const e of es){
    if(e.isIntersecting){
      e.target.classList.add('in');io.unobserve(e.target);
    }
  }
},{threshold:.15,rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('[data-reveal]').forEach(function(el){io.observe(el)});

/* ── count-up ── */
const co=new IntersectionObserver(function(es){
  for(const e of es){
    if(!e.isIntersecting)continue;
    co.unobserve(e.target);
    const el=e.target,n=+el.dataset.yen;
    if(RM){el.textContent='¥'+n.toLocaleString();continue}
    const t0=performance.now();
    (function f(t){
      const p=Math.min((t-t0)/900,1),v=Math.round(n*(1-Math.pow(1-p,3)));
      el.textContent='¥'+v.toLocaleString();
      if(p<1)requestAnimationFrame(f);
    })(t0);
  }
},{threshold:.6});
document.querySelectorAll('[data-yen]').forEach(function(el){co.observe(el)});

/* ── FAQ フリップ ── */
document.querySelectorAll('.qa .q').forEach(function(b){
  b.addEventListener('click',function(){
    const qa=b.closest('.qa');
    const open=qa.classList.toggle('open');
    b.setAttribute('aria-expanded',open);
  });
});

/* ── 進行レール(東南西北) ── */
const rail=document.getElementById('rail');
if(rail){
  const chaps=Array.from(document.querySelectorAll('.chap'));
  const dots=Array.from(rail.querySelectorAll('a'));
  const cio=new IntersectionObserver(function(es){
    for(const e of es){
      if(e.isIntersecting){
        const i=chaps.indexOf(e.target);
        dots.forEach(function(d,j){d.classList.toggle('on',j===i)});
      }
    }
  },{threshold:.45});
  chaps.forEach(function(c){cio.observe(c)});
  addEventListener('scroll',function(){
    const first=chaps[0].getBoundingClientRect(),last=chaps[chaps.length-1].getBoundingClientRect();
    rail.classList.toggle('vis',first.top<innerHeight*.7&&last.bottom>innerHeight*.25);
  },{passive:true});
}

/* ── mandala parallax ── */
const mk=document.querySelector('.hero-mark');
if(mk&&!RM){
  addEventListener('scroll',function(){mk.style.setProperty('--py',(scrollY*0.14)+'px')},{passive:true});
}

/* ── floating gems & petals(宝石メイン) ── */
const cv=document.getElementById('petals');
if(cv&&!RM){
  const cx=cv.getContext('2d');
  let W,H;const P=[];
  const GEMC=[['#F09EC2','#FBD3E4'],['#E890B4','#F7BAD4'],['#F2AFC8','#FBDDE9']];
  const PETC=['#F7CFDD','#F2AFC8','#FBDDE9'];
  function rs(){W=cv.width=cv.offsetWidth*devicePixelRatio;H=cv.height=cv.offsetHeight*devicePixelRatio}
  function mk1(top){
    const gem=Math.random()<0.7;
    const gc=GEMC[Math.random()*GEMC.length|0];
    return{
      gem:gem,c1:gc[0],c2:gc[1],c:PETC[Math.random()*PETC.length|0],
      x:Math.random()*W,y:top?-24*devicePixelRatio:Math.random()*H,
      s:((gem?6:5)+Math.random()*6)*devicePixelRatio,
      vy:((gem?.22:.35)+Math.random()*(gem?.35:.55))*devicePixelRatio,
      ph:Math.random()*Math.PI*2,sw:(.35+Math.random()*.6)*devicePixelRatio,
      a:Math.random()*Math.PI*2,va:(Math.random()-.5)*(gem?.012:.02),
      o:(gem?.5:.35)+Math.random()*.3
    };
  }
  rs();addEventListener('resize',rs);
  for(let i=0;i<15;i++)P.push(mk1(false));
  function drawGem(p){
    cx.save();cx.translate(p.x,p.y);cx.rotate(p.a);
    const tw=.72+.28*Math.sin(p.ph*2.2);   /* きらめき(明滅) */
    cx.globalAlpha=p.o*tw;
    const s=p.s;
    /* 台座(カイトカット) */
    cx.beginPath();cx.moveTo(0,-s);cx.lineTo(.62*s,-.2*s);cx.lineTo(0,s);cx.lineTo(-.62*s,-.2*s);cx.closePath();
    cx.fillStyle=p.c1;cx.fill();
    cx.strokeStyle='rgba(201,162,75,.8)';cx.lineWidth=Math.max(1,s*.08);cx.stroke();
    /* 上面ファセット */
    cx.beginPath();cx.moveTo(0,-s);cx.lineTo(.33*s,-.2*s);cx.lineTo(0,.08*s);cx.lineTo(-.33*s,-.2*s);cx.closePath();
    cx.fillStyle=p.c2;cx.fill();
    /* 白いグリント */
    cx.beginPath();cx.arc(-.15*s,-.45*s,Math.max(1,s*.1),0,6.3);
    cx.fillStyle='#fff';cx.fill();
    cx.restore();
  }
  function petal(p){
    cx.save();cx.translate(p.x,p.y);cx.rotate(p.a);
    cx.globalAlpha=p.o;cx.fillStyle=p.c;
    cx.beginPath();cx.moveTo(0,-p.s);
    cx.bezierCurveTo(p.s*.9,-p.s*.5,p.s*.7,p.s*.7,0,p.s);
    cx.bezierCurveTo(-p.s*.7,p.s*.7,-p.s*.9,-p.s*.5,0,-p.s);
    cx.fill();cx.restore();
  }
  let last=0;
  function loop(t){
    if(t-last>1000/40){
      last=t;cx.clearRect(0,0,W,H);
      for(let i=0;i<P.length;i++){
        const p=P[i];
        p.ph+=.012;p.a+=p.va;p.y+=p.vy;p.x+=Math.sin(p.ph)*p.sw*.5;
        if(p.y>H+30)P[i]=mk1(true);
        if(p.gem)drawGem(p);else petal(p);
      }
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
