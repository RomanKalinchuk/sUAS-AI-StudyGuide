let animationId;

export function initSwarm() {
    const canvas = document.getElementById('swarmCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width = canvas.parentElement.clientWidth - 64;
    canvas.height = 400;

    const boids = [];
    const NUM_BOIDS = 60;
    const VISUAL_RANGE = 60;
    const SEPARATION_RANGE = 20;
    const SPEED_LIMIT = 3;

    class Boid {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.dx = (Math.random() - 0.5) * 4;
            this.dy = (Math.random() - 0.5) * 4;
        }

        draw() {
            const angle = Math.atan2(this.dy, this.dx);
            ctx.translate(this.x, this.y);
            ctx.rotate(angle);
            ctx.translate(-this.x, -this.y);
            ctx.fillStyle = '#0ea5e9';
            ctx.beginPath();
            ctx.moveTo(this.x + 8, this.y);
            ctx.lineTo(this.x - 6, this.y + 5);
            ctx.lineTo(this.x - 6, this.y - 5);
            ctx.fill();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
        }

        update(flock) {
            const sepW = parseFloat(document.getElementById('sep-slider').value);
            const aliW = parseFloat(document.getElementById('ali-slider').value);
            const cohW = parseFloat(document.getElementById('coh-slider').value);

            let centerX = 0, centerY = 0;
            let avgDx = 0, avgDy = 0;
            let moveX = 0, moveY = 0;
            let numNeighbors = 0;

            for (const other of flock) {
                if (other === this) continue;
                const dist = Math.hypot(this.x - other.x, this.y - other.y);
                if (dist < VISUAL_RANGE) {
                    centerX += other.x;
                    centerY += other.y;
                    avgDx += other.dx;
                    avgDy += other.dy;
                    numNeighbors++;
                    if (dist < SEPARATION_RANGE) {
                        moveX += this.x - other.x;
                        moveY += this.y - other.y;
                    }
                }
            }

            if (numNeighbors > 0) {
                centerX /= numNeighbors;
                centerY /= numNeighbors;
                avgDx /= numNeighbors;
                avgDy /= numNeighbors;
                this.dx += (centerX - this.x) * (0.005 * cohW);
                this.dy += (centerY - this.y) * (0.005 * cohW);
                this.dx += (avgDx - this.dx) * (0.05 * aliW);
                this.dy += (avgDy - this.dy) * (0.05 * aliW);
            }

            this.dx += moveX * (0.05 * sepW);
            this.dy += moveY * (0.05 * sepW);

            const speed = Math.hypot(this.dx, this.dy);
            if (speed > SPEED_LIMIT) {
                this.dx = (this.dx / speed) * SPEED_LIMIT;
                this.dy = (this.dy / speed) * SPEED_LIMIT;
            }

            this.x = (this.x + this.dx + canvas.width) % canvas.width;
            this.y = (this.y + this.dy + canvas.height) % canvas.height;
        }
    }

    for (let i = 0; i < NUM_BOIDS; i++) boids.push(new Boid());
    if (animationId) cancelAnimationFrame(animationId);

    function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const boid of boids) {
            boid.update(boids);
            boid.draw();
        }
        animationId = requestAnimationFrame(loop);
    }
    loop();
}
