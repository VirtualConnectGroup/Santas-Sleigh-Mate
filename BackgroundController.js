// Santa's Sleigh Mate - BackgroundController.js
import * as ecs from '@8thwall/ecs'  // Access the ecs library

// Background Controller Component
// Handles the background scenery for Santa's Sleigh Mate
ecs.registerComponent({
    name: 'backgroundController',
    stateMachine: ({ world, eid }) => {
        // Adjust the scale of the background depending on the device type
        const adjustScaleForDevice = () => {
            const isDesktop = world.platform === 'desktop'
            const scale = isDesktop ? { x: 5, y: 6, z: 5 } : { x: 3, y: 6, z: 3 }  // Adjust scale for wider screens on desktop
            world.setScale(eid, scale.x, scale.y, scale.z)
        }

        ecs.defineState('start').initial()
            .onEnter(() => {
                // Adjust scale when the game starts and listen for device-specific adjustments
                adjustScaleForDevice()
                world.events.addListener(world.events.globalId, 'deviceChange', adjustScaleForDevice)
            })
            .onExit(() => {
                // Remove the device change listener when exiting the state
                world.events.removeListener(world.events.globalId, 'deviceChange', adjustScaleForDevice)
            })
    },
})
