import { Fragment, useRef, useState, useCallback } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import domtoimage from 'dom-to-image'

export default function ContestSocial({
  open,
  setOpen,
  name,
  place,
  ctfPoints,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  name: string
  place: number
  ctfPoints: number
}) {
  const cancelButtonRef = useRef(null)
  const [image, setImage] = useState<string | undefined>(undefined)
  const designRef = useCallback((designRef) => {
    if (designRef) {
      setTimeout(() => domtoimage.toPng(designRef).then(setImage), 100)
    }
  }, [])

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        initialFocus={cancelButtonRef}
        onClose={setOpen}
      >
        <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-800 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="hidden sm:inline-block sm:h-screen sm:align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block transform overflow-hidden rounded-lg bg-gray-900 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:align-middle md:w-fit">
              <div className="w-fit bg-gray-900 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="relative">
                  <div
                    ref={designRef}
                    className="h-[500px] w-[1000px] bg-cover bg-center bg-no-repeat text-black"
                    style={{
                      backgroundImage: 'url(/static/images/sekai-bg.jpg)',
                    }}
                  >
                    <div
                      className={
                        (place == 1
                          ? 'from-yellow-500 to-yellow-700 after:border-yellow-700'
                          : 'from-rose-600 to-rose-800 after:border-rose-800') +
                        ' z-1 relative ml-8 flex h-[10rem] w-32 items-end justify-center bg-gradient-to-b pb-3 text-white after:absolute after:left-0 after:top-full after:box-border after:h-8 after:w-32 after:border-b-[4rem] after:border-l-[4rem] after:border-r-[4rem] after:border-b-transparent'
                      }
                    >
                      <span
                        className={
                          (place >= 100
                            ? ''
                            : place >= 10
                            ? 'text-6xl font-semibold'
                            : place >= 2
                            ? 'text-6xl font-bold'
                            : 'text-7xl font-bold') +
                          ' inline-block leading-none'
                        }
                      >
                        <sup>#</sup>
                        {place}
                      </span>
                    </div>
                    <div className="absolute bottom-8 left-8 w-8/12">
                      <h4 className="text-3xl font-semibold">
                        {ctfPoints} pts
                      </h4>
                      <h1 className="text-6xl font-bold">{name}</h1>
                    </div>
                    <img
                      src="/static/images/fullLogo.png"
                      alt="Logo"
                      className="absolute right-8 top-8 w-3/12"
                    />
                  </div>
                  <img
                    src={image}
                    alt="Share this for contest"
                    className="-z-1 absolute left-0 top-0 h-[500px] w-[1000px]"
                  />
                </div>
              </div>
              <div className="bg-gray-800 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-700 bg-gray-700 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => setOpen(false)}
                  ref={cancelButtonRef}
                >
                  Close
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
