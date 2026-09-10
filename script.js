// ============================================================
// 1. Зоряний пил / частинки мультивсесвіту
// ============================================================
const canvas = document.getElementById('ash-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let mouse = { x: null, y: null, radius: window.innerWidth < 768 ? 70 : 110 };

window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});

window.addEventListener('touchmove', (e) => {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
}, { passive: true });

window.addEventListener('mouseout', () => {
    mouse.x = undefined;
    mouse.y = undefined;
});

window.addEventListener('touchend', () => {
    mouse.x = undefined;
    mouse.y = undefined;
});

function resizeCanvas() {
    width = canvas.width = canvas.clientWidth || window.innerWidth;
    height = canvas.height = canvas.clientHeight || window.innerHeight;
    mouse.radius = window.innerWidth < 768 ? 70 : 110;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Кольори пилу підібрані під арт: біле, бузкове, бірюзове, рожеве
const DUST_COLORS = [
    [255, 255, 255],
    [186, 150, 255],
    [110, 232, 220],
    [255, 140, 200]
];

const particlesArray = [];
const numberOfParticles = window.innerWidth < 768 ? 45 : 85;

class Particle {
    constructor() {
        this.reset(true);
    }
    reset(randomY) {
        this.x = Math.random() * width;
        this.y = randomY ? Math.random() * height : height + 10;
        this.size = Math.random() * 1.6 + 0.4;
        this.density = (Math.random() * 26) + 4;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.45 + 0.12;
        this.opacity = Math.random() * 0.55 + 0.15;
        this.color = DUST_COLORS[Math.floor(Math.random() * DUST_COLORS.length)];
        // Мерехтіння зірок
        this.twinkleSpeed = Math.random() * 0.02 + 0.005;
        this.twinklePhase = Math.random() * Math.PI * 2;
    }
    update() {
        this.x += this.speedX;
        this.y -= this.speedY;
        this.twinklePhase += this.twinkleSpeed;

        if (this.y < -this.size) this.reset(false);
        if (this.x < -this.size || this.x > width + this.size) {
            this.x = Math.random() * width;
        }

        // Частинки розлітаються від курсора / пальця
        if (mouse.x && mouse.y) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < mouse.radius && distance > 0) {
                const force = (mouse.radius - distance) / mouse.radius;
                this.x -= (dx / distance) * force * this.density;
                this.y -= (dy / distance) * force * this.density;
            }
        }
    }
    draw() {
        const twinkle = 0.65 + Math.sin(this.twinklePhase) * 0.35;
        const [r, g, b] = this.color;
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.opacity * twinkle})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// --- Метеори: зрідка через небо пролітає падаюча зірка ---
class Meteor {
    constructor() {
        this.reset();
    }
    reset() {
        // Летить по діагоналі вниз-праворуч, стартує зверху або зліва
        this.x = Math.random() * width * 0.7 - width * 0.1;
        this.y = -40 - Math.random() * height * 0.2;
        this.speed = 6 + Math.random() * 5;
        this.length = 80 + Math.random() * 140;
        this.angle = Math.PI / 5 + Math.random() * 0.25;
        this.alpha = 0;
        this.fade = 'in';
        this.color = Math.random() < 0.5 ? '186, 150, 255' : '255, 255, 255';
        this.done = false;
    }
    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        if (this.fade === 'in') {
            this.alpha += 0.05;
            if (this.alpha >= 0.9) this.fade = 'out';
        } else {
            this.alpha -= 0.012;
        }

        if (this.alpha <= 0 || this.y > height + this.length || this.x > width + this.length) {
            this.done = true;
        }
    }
    draw() {
        const tailX = this.x - Math.cos(this.angle) * this.length;
        const tailY = this.y - Math.sin(this.angle) * this.length;
        const grad = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
        grad.addColorStop(0, `rgba(${this.color}, ${Math.max(this.alpha, 0)})`);
        grad.addColorStop(1, `rgba(${this.color}, 0)`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
    }
}

const meteors = [];
let nextMeteorAt = performance.now() + 2000;

function scheduleMeteor(now) {
    // Наступна падаюча зірка через 4-11 секунд
    nextMeteorAt = now + 4000 + Math.random() * 7000;
}

function init() {
    for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
    }
}

function animate(now) {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
    }

    if (now >= nextMeteorAt) {
        meteors.push(new Meteor());
        scheduleMeteor(now);
    }

    for (let i = meteors.length - 1; i >= 0; i--) {
        meteors[i].update();
        meteors[i].draw();
        if (meteors[i].done) meteors.splice(i, 1);
    }

    requestAnimationFrame(animate);
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reducedMotion) {
    init();
    requestAnimationFrame(animate);
}


// ============================================================
// 2. Делікатний 3D-нахил (тільки для мишки)
// ============================================================
if (window.matchMedia('(hover: hover)').matches) {
    // Даємо анімації появи відпрацювати, щоб inline-transform її не перебив
    window.setTimeout(() => {
        document.querySelectorAll('.tilt').forEach(element => {
            element.addEventListener('mousemove', e => {
                const rect = element.getBoundingClientRect();
                const rotateX = ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -5;
                const rotateY = ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 5;
                element.style.transition = 'none';
                element.style.transform =
                    `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            });

            element.addEventListener('mouseleave', () => {
                element.style.transition = 'transform 0.5s ease-out';
                element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            });
        });
    }, 1400);
}

// ============================================================
// 3. Перемикач мов і хаптик
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    const langBtns = document.querySelectorAll('.lang-btn');
    const body = document.body;

    // Мова за замовчуванням — англійська (задана в data-lang на <body>).
    // Памʼятаємо вибір мови між візитами
    const savedLang = (() => {
        try { return localStorage.getItem('mv-lang'); } catch (e) { return null; }
    })();

    function setLang(lang) {
        body.setAttribute('data-lang', lang);
        document.documentElement.lang = lang;
        langBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-lang-target') === lang));
        try { localStorage.setItem('mv-lang', lang); } catch (e) { /* приватний режим */ }
    }

    if (savedLang === 'uk' || savedLang === 'en') setLang(savedLang);

    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (navigator.vibrate) navigator.vibrate(30);
            setLang(btn.getAttribute('data-lang-target'));
        });
    });

    // Вібрація на всіх кнопках і посиланнях (Android; в iOS Apple блокує API)
    document.querySelectorAll('a, button').forEach(el => {
        el.addEventListener('click', () => {
            if (navigator.vibrate) navigator.vibrate(80);
        });
    });
});
