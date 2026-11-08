import { configure } from 'storybook/test'

// Headroom for a loaded CI runner: fixtures with timed behaviour, such as the
// status toast, stay well inside every wait.
configure({ asyncUtilTimeout: 5000 })
