// Santa's Sleigh Mate - ObstacleController.js
import * as ecs from '@8thwall/ecs'  // Access the ecs library

// Obstacle Controller Component
// Handles control of randomizing and moving obstacles toward Santa's sleigh
ecs.registerComponent({
    name: 'obstacleController',
    schema: {
        obstacleMoveSpeed: ecs.f32,  // Obstacle Movement Speed as a 32-bit float
        leftBound: ecs.f32,  // Left boundary where obstacles will reset their position
        maxHeight: ecs.f32,  // The maximum height obstacles can spawn as a 32-bit float
        minHeight: ecs.f32,  // The minimum height obstacles can spawn as a 32-bit float
    },
    schemaDefaults: {
        obstacleMoveSpeed: 8,  // Default movement speed for obstacles
        leftBound: -30,  // Default left boundary
        maxHeight: 6,  // Maximum height for obstacles
        minHeight: -5,  // Minimum height for obstacles
    },
    data: {
        numObstacles: ecs.f32,  // Number of obstacles that are children of the entity
        gameActive: ecs.boolean,  // Flag indicating if the game is active
    },
    stateMachine: ({ world, eid, schemaAttribute, dataAttribute }) => {
        const { maxHeight, minHeight } = schemaAttribute.get(eid)

        ecs.defineState('start').initial()  // Initial state
            .onEvent('startGame', 'inGame', { target: world.events.globalId })
            .onExit(() => {
                dataAttribute.cursor(eid).gameActive = true  // Set game as active
            })

        ecs.defineState('inGame')  // In-game state where obstacles are active
            .onEvent('gameOver', 'finishGame', { target: world.events.globalId })
            .onExit(() => {
                dataAttribute.cursor(eid).gameActive = false  // Stop obstacles on game over
            })

        ecs.defineState('finishGame')  // Finish state to handle restart
            .onEvent('restart', 'start', { target: world.events.globalId })
            .onExit(() => {
                // Reposition obstacles when restarting the game
                const offset = schemaAttribute.cursor(eid).leftBound / dataAttribute.cursor(eid).numObstacles
                let yPosition
                let index = 0
                for (const obstacle of world.getChildren(eid)) {
                    const xPosition = index * offset  // Evenly space out each obstacle
                    // Randomize the y position within the upper and lower bounds
                    yPosition = Math.floor(Math.random() * (maxHeight - minHeight) + minHeight)
                    world.setPosition(obstacle, -xPosition, yPosition, 0)  // Set final position for each obstacle
                    index++
                }
            })
    },
    add: (world, component) => {
        component.dataAttribute.cursor(component.eid).gameActive = false  // Initialize game as inactive
        component.dataAttribute.cursor(component.eid).numObstacles = 0  // Initialize obstacle count
        // Count the number of child entities to determine the number of obstacles
        for (const eid of world.getChildren(component.eid)) {
            component.dataAttribute.cursor(component.eid).numObstacles += 1
        }
    },
    tick: (world, component) => {
        const moveDistance = (component.schema.obstacleMoveSpeed * world.time.delta) / 1000
        const { gameActive } = component.dataAttribute.cursor(component.eid)

        if (gameActive) {
            for (const obstacle of world.getChildren(component.eid)) {
                const obstaclePosition = ecs.Position.get(world, obstacle)  // Get current position
                let newX = obstaclePosition.x - moveDistance
                let yPosition = obstaclePosition.y
                const zPosition = obstaclePosition.z

                // If the obstacle crosses the left boundary, reset position and randomize height
                if (newX < component.schema.leftBound) {
                    yPosition = Math.floor(Math.random() * (component.schema.maxHeight -
                        component.schema.minHeight) + component.schema.minHeight)
                    newX += component.schema.resetOffset
                }
                // Update position for the current frame
                world.setPosition(obstacle, newX, yPosition, zPosition)
            }
        }
    },
})
