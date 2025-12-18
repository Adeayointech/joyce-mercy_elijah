function show(message, type='info'){
  try{
    window.dispatchEvent(new CustomEvent('app-toast', { detail: { message, type } }))
  }catch(e){ console.log('toast', message) }
}

export default show
