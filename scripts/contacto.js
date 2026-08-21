const f=document.querySelector("#contactForm"),m=document.querySelector("#mensaje");
f.onsubmit=e=>{
  e.preventDefault();
  const v=id=>document.querySelector(id).value.trim();
  const mail=v("#mail").includes("@");
  const tel=/^[0-9]{5,12}$/.test(v("#telefono"));
  if(!v("#nombre")||!mail||!v("#asunto")||!v("#descripcion"))
    return m.textContent="Make sure to complete all information before submitting.";
  m.textContent="Sent succesfully!";
};