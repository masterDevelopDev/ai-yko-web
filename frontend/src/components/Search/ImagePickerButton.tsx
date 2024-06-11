import { CameraIcon } from '@heroicons/react/24/outline'
import { Button, FileButton } from '@mantine/core'

import '@mantine/dates/styles.css'

const ImagePickerButton = ({
  addFiles,
}: {
  addFiles: (files: File[]) => void
}) => {
  return (
    <FileButton onChange={addFiles} accept="image/png,image/jpeg" multiple>
      {(props) => (
        <Button
          classNames={{
            loader: 'hidden',
          }}
          {...props}
          unstyled
        >
          <CameraIcon color="black" className="w-5 cursor-pointer md:w-9" />
        </Button>
      )}
    </FileButton>
  )
}

export default ImagePickerButton
