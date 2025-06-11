document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d", { alpha: true });

    if (!canvas || !ctx) return;

    const config = {
        background: "rgba(255, 255, 255, 0)",
        color: "rgb(255, 21, 165)", // Updated color
    };

    const dots = [];
    let mouseX = -1000;
    let mouseY = -1000;
    let mouseDown = false;
    let holdStartTime = 0; // Track when the hold starts
    let holdDuration = 0; // Duration of the hold in seconds

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
            this.repelStrength = 1.0;
            this.baseAttractStrength = 0.8; // Base attraction strength
            this.baseMaxDistance = 100; // Base max distance
        }

        update() {
            const dx = this.x - mouseX;
            const dy = this.y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Dynamic attraction strength and range based on hold duration
            const attractStrength = this.baseAttractStrength * (1 + holdDuration * 0.5); // Strength increases over time
            const maxDistance = this.baseMaxDistance * (1 + holdDuration * 0.5); // Range increases over time

            if (distance < maxDistance && distance > 0) {
                const angle = Math.atan2(dy, dx);
                const force = (maxDistance - distance) / maxDistance;

                if (mouseDown) {
                    // Attract: Pull toward mouse, stronger with longer hold
                    this.vx -= Math.cos(angle) * force * attractStrength;
                    this.vy -= Math.sin(angle) * force * attractStrength;
                } else {
                    // Repel: Push away when mouse is not held
                    this.vx += Math.cos(angle) * force * this.repelStrength;
                    this.vy += Math.sin(angle) * force * this.repelStrength;
                }
            }

            // Spring back to base position
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
        mouseDown = false;
        holdDuration = 0;
    });

    canvas.addEventListener("mousedown", () => {
        mouseDown = true;
        holdStartTime = Date.now(); // Record the start time of the hold
    });

    canvas.addEventListener("mouseup", () => {
        mouseDown = false;
        holdDuration = 0; // Reset hold duration on release
    });

    function animate() {
        // Update hold duration if mouse is held
        if (mouseDown) {
            holdDuration = (Date.now() - holdStartTime) / 1000; // Duration in seconds
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
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