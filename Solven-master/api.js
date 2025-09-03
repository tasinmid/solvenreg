const e1 = "https://lalapussy.app.n8n.cloud";
const e2 = "https://lalapussy.app.n8n.cloud";

export async function sendLeadsRequest(formData){
  const endpoint1 = `${e1}/webhook/leads`;
  try{
    await fetch(endpoint1,{
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify(formData)
    });
  }catch(err){ console.error("Error sending leads request:", err); }
}

export async function sendNotesRequest(email, note){
  const endpoint2 = `${e2}/webhook/notes`;
  try{
    await fetch(endpoint2,{
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ email, note })
    });
  }catch(err){ console.error("Error sending notes request:", err); }
}
