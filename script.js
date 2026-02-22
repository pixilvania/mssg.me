// 1. Анімація частинок (Попіл у повітрі)
const canvas = document.getElementById('ash-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let mouse = { x: null, y: null, radius: window.innerWidth < 768 ? 60 : 100 };

window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});

window.addEventListener('touchmove', (e) => {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
});

window.addEventListener('mouseout', () => {
    mouse.x = undefined;
    mouse.y = undefined;
});

window.addEventListener('touchend', () => {
    mouse.x = undefined;
    mouse.y = undefined;
});

function resizeCanvas() {
    // Використовуємо clientWidth/Height, бо CSS розтягує canvas за safe area
    width = canvas.width = canvas.clientWidth || window.innerWidth;
    height = canvas.height = canvas.clientHeight || window.innerHeight;
    mouse.radius = window.innerWidth < 768 ? 60 : 100;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();


const particlesArray = [];
// Кількість пилинок
const numberOfParticles = window.innerWidth < 768 ? 30 : 60;

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 0.5;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 + 0.5; // Падають або летять вверх повільно
        this.opacity = Math.random() * 0.3 + 0.1;
    }
    update() {
        // Базовий рух
        this.x += this.speedX;
        this.y -= this.speedY;

        if (this.y < 0 - this.size) {
            this.y = height + this.size;
            this.x = Math.random() * width;
        }
        if (this.x < 0 - this.size || this.x > width + this.size) {
            this.x = Math.random() * width;
        }

        // Інтерактивність з мишкою/пальцем
        if (mouse.x && mouse.y) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;
            let maxDistance = mouse.radius;
            let force = (maxDistance - distance) / maxDistance;
            let directionX = forceDirectionX * force * this.density;
            let directionY = forceDirectionY * force * this.density;

            if (distance < mouse.radius) {
                this.x -= directionX;
                this.y -= directionY;
            }
        }
    }
    draw() {
        ctx.fillStyle = `rgba(180, 160, 150, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function init() {
    for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
    }
    requestAnimationFrame(animate);
}

init();
animate();

// 2. 3D Tilt Ефект
if (window.matchMedia("(hover: hover)").matches) {
    const tiltElements = document.querySelectorAll('.tilt');

    tiltElements.forEach(element => {
        element.addEventListener('mousemove', e => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;

            element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        element.addEventListener('mouseleave', () => {
            element.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            element.style.transition = 'transform 0.5s ease-out';
            setTimeout(() => {
                element.style.transition = '';
            }, 500);
        });
    });
}

// 3. Перемикач мов і Хаптік (Вібрація)
document.addEventListener('DOMContentLoaded', () => {
    const langBtns = document.querySelectorAll('.lang-btn');
    const body = document.body;

    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Вібрація при перемиканні мови (iOS/Android)
            if (navigator.vibrate) navigator.vibrate(30);

            // Зняти активний клас з усіх
            langBtns.forEach(b => b.classList.remove('active'));
            // Додати активний клас натиснутій кнопці
            btn.classList.add('active');

            // Змінити data-lang атрибут на body
            const targetLang = btn.getAttribute('data-lang-target');
            body.setAttribute('data-lang', targetLang);
        });
    });

    // Додаємо вібрацію на всі кнопки і посилання
    const interactiveElements = document.querySelectorAll('a, button');
    interactiveElements.forEach(el => {
        el.addEventListener('click', () => {
            if (navigator.vibrate) {
                // Відчутна віддача на Андроїді. На iOS (iPhone) API вібрації заблоковано самою Apple.
                navigator.vibrate(80);
            }
        });
    });
});

