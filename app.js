document.addEventListener('DOMContentLoaded', function() {
    // Initialize Web3 and MetaMask connection
    let web3;
    let accounts = [];
    
    // Connect MetaMask
    document.getElementById('connectWallet').addEventListener('click', async () => {
        if (window.ethereum) {
            try {
                web3 = new Web3(window.ethereum);
                accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                
                if (accounts.length > 0) {
                    document.getElementById('connectWallet').classList.add('d-none');
                    const walletEl = document.getElementById('walletAddress');
                    walletEl.classList.remove('d-none');
                    walletEl.textContent = `${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`;
                    
                    // Enable transaction button
                    document.getElementById('sendTxBtn').disabled = false;
                    document.getElementById('spinBtn').disabled = false;
                    
                    // Load wallet data
                    loadWalletData();
                }
            } catch (error) {
                console.error("User denied account access", error);
            }
        } else {
            alert('Please install MetaMask to use this website!');
        }
    });
    
    // Initialize fee prediction chart
    const feeCtx = document.getElementById('feeChart').getContext('2d');
    const feeChart = new Chart(feeCtx, {
        type: 'line',
        data: {
            labels: Array.from({length: 30}, (_, i) => `${i*2}m`),
            datasets: [{
                label: 'Gas Fee Prediction',
                data: generateRandomFeeData(),
                borderColor: '#6c5ce7',
                backgroundColor: 'rgba(108, 92, 231, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#aaa'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#aaa'
                    }
                }
            }
        }
    });
    
    // Update fee prediction periodically
    setInterval(() => {
        feeChart.data.datasets[0].data = generateRandomFeeData();
        feeChart.update();
        
        // Randomly update fee prediction text
        const predictions = ['Lower in 5 min', 'Higher in 3 min', 'Stable for 10 min', 'Spiking soon'];
        const levels = ['Low', 'Medium', 'High'];
        document.getElementById('feePrediction').innerHTML = `
            <span class="badge bg-info">Current Fee: ${levels[Math.floor(Math.random() * levels.length)]}</span>
            <span class="badge bg-success ms-2">Predicted: ${predictions[Math.floor(Math.random() * predictions.length)]}</span>
        `;
    }, 10000);
    
    // Fee range slider
    const feeRange = document.getElementById('feeRange');
    feeRange.addEventListener('input', function() {
        const levels = ['Low', 'Medium', 'High'];
        const times = ['10-30 minutes', '2-5 minutes', 'Instant'];
        const badges = ['bg-success', 'bg-warning', 'bg-danger'];
        
        const level = levels[this.value - 1];
        document.getElementById('feeLevel').textContent = level;
        document.getElementById('feeLevel').className = `badge ${badges[this.value - 1]}`;
        document.getElementById('feeEstimate').textContent = `Estimated time: ${times[this.value - 1]}`;
    });
    
    // Initialize spin wheel
    initWheel();
    
    // Spin wheel button
    document.getElementById('spinBtn').addEventListener('click', function() {
        spinWheel();
    });
    
    // Transaction form submission
    document.getElementById('transactionForm').addEventListener('submit', function(e) {
        e.preventDefault();
        sendTransaction();
    });
    
    // Update transaction timer
    updateTransactionTimer();
    setInterval(updateTransactionTimer, 1000);
});

function generateRandomFeeData() {
    const base = Math.random() * 50 + 20;
    return Array.from({length: 30}, (_, i) => {
        const variation = Math.sin(i / 3) * 15 + Math.random() * 10;
        return Math.max(10, base + variation);
    });
}

function initWheel() {
    const wheel = document.getElementById('wheel');
    const prizes = [
        { text: '0.001 ETH', color: '#e74c3c' },
        { text: '0.005 ETH', color: '#3498db' },
        { text: 'Try Again', color: '#2ecc71' },
        { text: '0.002 ETH', color: '#f39c12' },
        { text: '0.01 ETH', color: '#9b59b6' },
        { text: '0.003 ETH', color: '#1abc9c' }
    ];
    
    wheel.innerHTML = '';
    const segmentAngle = 360 / prizes.length;
    
    prizes.forEach((prize, i) => {
        const segment = document.createElement('div');
        segment.className = 'wheel-segment';
        segment.style.transform = `rotate(${i * segmentAngle}deg)`;
        segment.style.backgroundColor = prize.color;
        segment.style.clipPath = `polygon(0 0, 100% 0, 100% 100%)`;
        segment.innerHTML = `<span style="transform: rotate(${segmentAngle / 2}deg)">${prize.text}</span>`;
        wheel.appendChild(segment);
    });
}

function spinWheel() {
    const wheel = document.getElementById('wheel');
    const spinBtn = document.getElementById('spinBtn');
    
    spinBtn.disabled = true;
    const spins = 5 + Math.floor(Math.random() * 3); // 5-7 full spins
    const degrees = spins * 360 + Math.floor(Math.random() * 360);
    
    wheel.style.transform = `rotate(${-degrees}deg)`;
    
    setTimeout(() => {
        spinBtn.disabled = false;
        const segmentAngle = 360 / 6;
        const winningSegment = (degrees % 360) / segmentAngle;
        const prizes = ['0.001 ETH', '0.005 ETH', 'Try Again', '0.002 ETH', '0.01 ETH', '0.003 ETH'];
        
        alert(`You won: ${prizes[Math.floor(winningSegment)]}!`);
    }, 5000);
}

function sendTransaction() {
    // Simulate transaction
    const txList = document.getElementById('transactionList');
    const newTx = document.createElement('div');
    newTx.className = 'transaction-item';
    newTx.innerHTML = `
        <div class="d-flex justify-content-between">
            <span class="tx-hash">0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}</span>
            <span class="tx-time">Just now</span>
        </div>
        <div class="d-flex justify-content-between mt-1">
            <span>${(Math.random() * 2).toFixed(3)} ETH</span>
            <span class="text-warning">Pending</span>
        </div>
    `;
    
    txList.insertBefore(newTx, txList.firstChild);
    
    // Simulate confirmation after 5-15 seconds
    setTimeout(() => {
        const status = Math.random() > 0.1 ? 'text-success">Completed' : 'text-danger">Failed';
        newTx.querySelector('.text-warning').outerHTML = `<span class="${status}</span>`;
    }, 5000 + Math.random() * 10000);
    
    // Reset timer
    lastTransactionTime = Date.now();
    updateTransactionTimer();
}

let lastTransactionTime = 0;
function updateTransactionTimer() {
    if (lastTransactionTime === 0) {
        document.getElementById('transactionTimer').textContent = 'No recent transactions';
        return;
    }
    
    const seconds = Math.floor((Date.now() - lastTransactionTime) / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
        document.getElementById('transactionTimer').textContent = `Last tx: ${minutes}m ${remainingSeconds}s ago`;
    } else {
        document.getElementById('transactionTimer').textContent = `Last tx: ${seconds}s ago`;
    }
}

function loadWalletData() {
    // Simulate loading wallet balances
    const balances = document.getElementById('walletBalance');
    balances.innerHTML = `
        <div class="balance-item d-flex justify-content-between">
            <span>ETH</span>
            <span>${(Math.random() * 2).toFixed(4)}</span>
        </div>
        <div class="balance-item d-flex justify-content-between">
            <span>USDT</span>
            <span>${(Math.random() * 500).toFixed(2)}</span>
        </div>
        <div class="balance-item d-flex justify-content-between">
            <span>BTC</span>
            <span>${(Math.random() * 0.1).toFixed(6)}</span>
        </div>
    `;
}