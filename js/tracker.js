document.querySelector("form").addEventListener("submit", function(event) {
  event.preventDefault();

  const startDate = new Date(document.querySelector('input[type="date"]').value);
  const cycleLength = parseInt(document.querySelectorAll('input[type="number"]')[1].value);

  // Calculate next period
  const nextPeriod = new Date(startDate);
  nextPeriod.setDate(startDate.getDate() + cycleLength);

  // Calculate ovulation
  const ovulation = new Date(nextPeriod);
  ovulation.setDate(nextPeriod.getDate() - 14);

  // Calculate fertile window
  const fertileStart = new Date(ovulation);
  fertileStart.setDate(ovulation.getDate() - 2);

  const fertileEnd = new Date(ovulation);
  fertileEnd.setDate(ovulation.getDate() + 2);

  document.getElementById("predictionResult").innerHTML = `
Next Period: ${nextPeriod.toDateString()} <br>
Ovulation Day: ${ovulation.toDateString()} <br>
Fertile Window: ${fertileStart.toDateString()} - ${fertileEnd.toDateString()}
`;

  let history = JSON.parse(localStorage.getItem("cycleHistory")) || [];

history.push({
    start: startDate.toDateString(),
    next: nextPeriod.toDateString()
});

localStorage.setItem("cycleHistory", JSON.stringify(history));

function loadHistory() {
    let history = JSON.parse(localStorage.getItem("cycleHistory")) || [];

    const historyList = document.getElementById("cycleHistory");
    historyList.innerHTML = "";

    history.forEach(cycle => {
        let li = document.createElement("li");
        li.textContent = `Start: ${cycle.start} → Next: ${cycle.next}`;
        historyList.appendChild(li);
    });
}

loadHistory();
});