const quotes = [
    "Believe you can and you're halfway there.",
    "Success is the sum of small efforts repeated day in and day out.",
    "You are capable of amazing things.",
    "Don't watch the clock. Do what it does—keep going.",
    "Push yourself, because no one else is going to do it for you.",
    "Stay positive, work hard, make it happen.",
    "Every accomplishment starts with the decision to try.",
    "Great things never come from comfort zones.",
    "Dream big. Start small. Act now.",
    "You’ve got this! Keep going."
  ];
  
  function showQuoteAndBloom() {
    const quoteEl = document.getElementById("quote");
    const randomIndex = Math.floor(Math.random() * quotes.length);
    quoteEl.textContent = `"${quotes[randomIndex]}"`;
  }
  
  function copyQuote() {
    const quoteText = document.getElementById("quote").innerText;
    navigator.clipboard.writeText(quoteText).then(() => {
      alert("Quote copied to clipboard!");
    });
  }
  
  function tweetQuote() {
    const quoteText = document.getElementById("quote").innerText;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(quoteText)}`;
    window.open(tweetUrl, '_blank', 'noopener,noreferrer');
  }
  
  function whatsappQuote() {
    const quoteText = document.getElementById("quote").innerText;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(quoteText)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  }
  
  
  function bloomFlower() {
    const flower = document.querySelector('.flower');
    flower.style.transform = "scale(1.5)"; 
    flower.style.transition = "transform 0.3s ease"; 
  
    setTimeout(() => {
      flower.style.transform = "scale(1)";
    }, 1000); 
  }