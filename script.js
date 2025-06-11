document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d", { alpha: true }); // Ensure alpha for transparency

    if (!canvas || !ctx) return;

    const config = {
        background: "rgba(255, 255, 255, 0)",
        color: "rgb(255, 21, 165)",
    };

    const dots = [];
    let mouseX = -1000;
    let mouseY = -1000;

    class Dot {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.baseX = x;
            this.baseY = y;
            this.vx = 0;
            this.vy = 0;
            this.radius = 8;
            this.friction = 0.9;
            this.spring = 0.03;
            this.repelStrength = 1.0; // Increased for stronger effect
            this.maxDistance = 100; // Increased further for larger canvas
        }

        update() {
            const dx = this.x - mouseX;
            const dy = this.y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.maxDistance && distance > 0) { // Added distance > 0 to avoid division issues
                const angle = Math.atan2(dy, dx);
                const force = (this.maxDistance - distance) / this.maxDistance;
                this.vx += Math.cos(angle) * force * this.repelStrength;
                this.vy += Math.sin(angle) * force * this.repelStrength;
            }

            const springForceX = (this.baseX - this.x) * this.spring;
            const springForceY = (this.baseY - this.y) * this.spring;

            this.vx += springForceX;
            this.vy += springForceY;

            this.vx *= this.friction;
            this.vy *= this.friction;

            this.x += this.vx;
            this.y += this.vy;
        }

        draw() {
            ctx.fillStyle = config.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function isInsideHeart(x, y, centerX, centerY, scale) {
        const nx = (x - centerX) / scale;
        const ny = -(y - centerY) / scale;

        const x2 = nx * nx;
        const y2 = ny * ny;
        const y3 = ny * y2;
        return Math.pow(x2 + y2 - 1, 3) - x2 * y3 < 0;
    }

    function createHeartParticles() {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const scale = 180;
        const step = 20;

        for (let x = 0; x < canvas.width; x += step) {
            for (let y = 0; y < canvas.height; y += step) {
                if (isInsideHeart(x, y, centerX, centerY, scale)) {
                    dots.push(new Dot(x, y));
                }
            }
        }
    }

    canvas.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });

    canvas.addEventListener("mouseleave", () => {
        mouseX = -1000;
        mouseY = -1000;
    });

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas directly
        ctx.fillStyle = config.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let dot of dots) {
            dot.update();
            dot.draw();
        }

        requestAnimationFrame(animate);
    }

    createHeartParticles();
    animate();
});