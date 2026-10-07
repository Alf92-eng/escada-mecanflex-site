
const form=document.querySelector('#calculator-form'), heightInput=document.querySelector('#altura');
const error=document.querySelector('#height-error'),region=document.querySelector('#weight-region');
const output=document.querySelector('#peso'),status=document.querySelector('#result-status');
const decrease=document.querySelector('#decrease'),increase=document.querySelector('#increase');
const formatter=new Intl.NumberFormat('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
let timer,controller,revision=0;
function readInputs(){
 const raw=heightInput.value.trim(),height=Number(raw.replace(',','.'));
 const valid=/^\d+(?:[.,]\d+)?$/.test(raw)&&Number.isFinite(height)&&height>=250&&height<=6000;
 decrease.disabled=!valid||height<=250; increase.disabled=!valid||height>=6000;
 return valid?{alturaCm:height,entrada:form.elements.entrada.value,saida:form.elements.saida.value}:null;
}
function update(delay=280){
 clearTimeout(timer);controller?.abort();const current=++revision,inputs=readInputs();
 status.removeAttribute('data-error');
 if(!inputs){
  heightInput.setAttribute('aria-invalid','true');error.textContent='Informe uma altura entre 250 e 6.000 cm.';error.hidden=false;
  output.textContent='—';region.setAttribute('aria-busy','false');status.textContent='Preencha a altura para ver o peso total.';return;
 }
 heightInput.removeAttribute('aria-invalid');error.hidden=true;output.textContent='—';region.setAttribute('aria-busy','true');status.textContent='Calculando seu equipamento…';
 timer=setTimeout(async()=>{
  const requestController=new AbortController();controller=requestController;
  const timeout=setTimeout(()=>requestController.abort(),12000);
  try{
   const response=await fetch('https://orguel-mecanflex.alfdsvd.chatgpt.site/api/peso',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(inputs),signal:requestController.signal});
   const data=await response.json();if(current!==revision)return;
   if(!response.ok||!Number.isFinite(data.pesoKg))throw new Error('Calculation unavailable');
   output.textContent=formatter.format(data.pesoKg);status.textContent='Peso calculado para a sua configuração.';
  }catch(exception){
   if(current!==revision)return;output.textContent='—';status.textContent='Não foi possível calcular. Tente novamente ou fale com um consultor.';status.dataset.error='true';
  }finally{clearTimeout(timeout);if(current===revision)region.setAttribute('aria-busy','false');}
 },delay);
}
heightInput.addEventListener('input',()=>update());
heightInput.addEventListener('focus',()=>heightInput.select());
form.addEventListener('change',event=>{if(event.target.type==='radio')update(0);});
form.addEventListener('submit',event=>{event.preventDefault();update(0);});
function step(amount){const inputs=readInputs();if(!inputs)return;heightInput.value=Math.max(250,Math.min(6000,inputs.alturaCm+amount));update(0);}
decrease.addEventListener('click',()=>step(-50));increase.addEventListener('click',()=>step(50));update(0);
