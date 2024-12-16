import CameraStreamWidget from '../components/widgets/CameraStreamWidget';

// Base widgets available for all modules
export const BASE_WIDGETS = [
  {
    id: 'camera',
    title: 'Camera Stream',
    component: CameraStreamWidget,
    type: 'camera_stream',
    configDefaults: {
      refreshInterval: 5,
      alertThreshold: 90,
      streamQuality: 'HD'
    },
    customConfig: [
      {
        name: 'streamQuality',
        label: 'Stream Quality',
        type: 'select',
        options: ['HD', '4K', '8K']
      },
      {
        name: 'enableAudio',
        label: 'Enable Audio',
        type: 'boolean'
      },
      {
        name: 'recordStream',
        label: 'Record Stream',
        type: 'boolean'
      }
    ]
  }
];
