import * as ecs from '@8thwall/ecs';
import { PlayAudio } from './AudioController';

// Obstacle Controller Component
ecs.registerComponent({
    name: 'obstacleController',
    schema: {
        obstacleMoveSpeed: ecs.f32,
        leftBound: ecs.f32,
        maxHeight: ecs.f32,
        minHeight: ecs.f32,
        baseObstacles: ecs.i32,
        levelIncreaseRate: ecs.f32,
        resetOffset: ecs.f32,
    },
    schemaDefaults: {
        obstacleMoveSpeed: 8,
        leftBound: -30,
        maxHeight: 6,
        minHeight: -5,
        baseObstacles: 8,
        levelIncreaseRate: 0.10,
        resetOffset: 100,
    },
    data: {
        numObstacles: ecs.i32,
        gameActive: ecs.boolean,
        level: ecs.i32,
    },
    stateMachine: ({ world, eid, schemaAttribute, dataAttribute }) => {
        const { maxHeight, minHeight, baseObstacles, levelIncreaseRate, resetOffset } = schemaAttribute.get(eid);

        // Initialize obstacles without referencing FloorManager.js
        const spawnInitialObstacles = () => {
            const currentLevel = dataAttribute.cursor(eid).level;
            const obstacleCount = Math.floor(baseObstacles * (1 + (currentLevel - 1) * levelIncreaseRate));
            const redRoofCount = Math.floor(obstacleCount / 2);
            const greenRoofCount = Math.floor(obstacleCount / 2);
            const additionalObstacles = obstacleCount - (redRoofCount + greenRoofCount);

            for (let i = 0; i < redRoofCount; i++) {
                createObstacle('redRoofHouse.glb', i);
            }
            for (let i = 0; i < greenRoofCount; i++) {
                createObstacle('greenRoofHouse.glb', i + redRoofCount);
            }
            for (let i = 0; i < additionalObstacles; i++) {
                const randomIndex = Math.floor(Math.random() * 3) + 2;  // Random obstacles
                createObstacle(obstacleTypes[randomIndex], i + redRoofCount + greenRoofCount);
            }
        };

        // Function to create obstacles, independent of FloorManager
        const createObstacle = (obstacleType, index) => {
            const xPosition = index * (schemaAttribute.get(eid).leftBound / dataAttribute.cursor(eid).numObstacles);
            const yPosition = Math.random() * (maxHeight - minHeight) + minHeight;
            const obstacleEntityId = ecs.createEntity();

            ecs.GltfModel.create(world, {
                eid: obstacleEntityId,
                url: obstacleType,
                position: { x: -xPosition, y: yPosition, z: 0 },
                scale: { x: 1, y: 1, z: 1 },
                rotation: { x: 0, y: 0, z: 0 },
            });

            ecs.Collider.create(world, {
                eid: obstacleEntityId,
                type: 'Box',
                isTrigger: true,
            });

            ecs.attachChild(eid, obstacleEntityId);
        };
    },
    add: (world, component) => {
        component.dataAttribute.cursor(component.eid).gameActive = false;
        component.dataAttribute.cursor(component.eid).level = 1;
        component.dataAttribute.cursor(component.eid).numObstacles = component.schema.baseObstacles;
    },
    tick: (world, component) => {
        const moveDistance = (component.schema.obstacleMoveSpeed * world.time.delta) / 1000;
        const { gameActive } = component.dataAttribute.cursor(component.eid);

        if (gameActive) {
            for (const obstacle of world.getChildren(component.eid)) {
                const obstaclePosition = ecs.Position.get(world, obstacle);
                let newX = obstaclePosition.x - moveDistance;
                let yPosition = obstaclePosition.y;
                const zPosition = obstaclePosition.z;

                if (newX < component.schema.leftBound) {
                    yPosition = Math.random() * (component.schema.maxHeight - component.schema.minHeight) + component.schema.minHeight;
                    newX += component.schema.resetOffset;
                }
                world.setPosition(obstacle, newX, yPosition, zPosition);
            }
        }
    },
});
