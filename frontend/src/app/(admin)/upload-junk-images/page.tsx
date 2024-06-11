'use client'

import SubmitButtonWithLoader from '@/components/SubmitButtonWithLoader'
import { ApiClient } from '@/lib/api-client'
import { Button, FileButton } from '@mantine/core'
import { useMutation } from '@tanstack/react-query'
import { useList } from '@uidotdev/usehooks'

const uploadJunkImages = async (imageFiles: File[]) => {
  const response =
    await ApiClient.search.searchControllerUploadJunkImages(imageFiles)

  return response.data
}

const UploadJunkImages = () => {
  const [
    selectedFiles,
    {
      push: addSelectedFiles,
      clear: resetSelectedFiles,
      removeAt: removeAtSelectedFile,
    },
  ] = useList<File>([])

  const handleUploadNewFiles = (files: File[]) => {
    ;[...(files ?? [])].map(addSelectedFiles)
  }

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: () => uploadJunkImages(selectedFiles),
    onSuccess: () => {
      resetSelectedFiles()
    },
  })

  return (
    <div className="p-10">
      <FileButton
        onChange={handleUploadNewFiles}
        accept="image/png,image/jpeg"
        multiple
      >
        {(props) => (
          <Button {...props}>
            Select images to exclude from search results
          </Button>
        )}
      </FileButton>

      <p>{selectedFiles.length} files</p>

      <SubmitButtonWithLoader
        text="Send"
        isLoading={isPending}
        type="button"
        onClick={mutate}
      />

      {isSuccess ? <p>Success</p> : null}
    </div>
  )
}

export default UploadJunkImages
