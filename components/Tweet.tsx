/**
 * Modified from react-tweet-embed, MIT license
 * react-tweet-embed, Copyright (c) 2016 Jiri Spac
 * https://github.com/capaj/react-tweet-embed/
 */

import React from 'react'

const callbacks = []

function addScript(src: string, cb: () => void) {
  if (callbacks.length === 0) {
    callbacks.push(cb)
    const s = document.createElement('script')
    s.setAttribute('src', src)
    s.onload = () => callbacks.forEach((cb) => cb())
    document.body.appendChild(s)
  } else {
    callbacks.push(cb)
  }
}

interface ITweetEmbedProps {
  tweetId: string
  options?: {
    id?: number
    cards?: 'hidden'
    conversation?: 'hidden'
    theme?: 'dark'
    width?: number
    align?: 'left' | 'right' | 'center'
    lang?: string
    dnt?: boolean
    chrome?: string
  }
  children?: string | React.ReactNode
  protocol?: string
  onTweetLoadSuccess?: (twitterWidgetElement: HTMLElement) => void
  onTweetLoadError?: (err: Error) => void
  className?: string
}

interface ITweetEmbedState {
  isLoading: boolean
}

class Tweet extends React.Component<ITweetEmbedProps> {
  _div?: HTMLDivElement

  static defaultProps = {
    protocol: 'https:',
    options: { theme: 'dark', align: 'center', chrome: 'transparent' },
    className: null,
  }

  state: ITweetEmbedState = {
    isLoading: true,
  }
  loadTweetForProps({ options, onTweetLoadSuccess, onTweetLoadError }: ITweetEmbedProps) {
    const renderTweet = () => {
      const twttr = window['twttr']
      twttr.ready().then(({ widgets }) => {
        // Clear previously rendered tweet before rendering the updated tweet id
        if (this._div) {
          this._div.innerHTML = ''
        }

        options = Object.assign({}, Tweet.defaultProps, options)
        widgets
          .createTweetEmbed(this.props.tweetId, this._div, options)
          .then((twitterWidgetElement) => {
            this.setState({
              isLoading: false,
            })
            onTweetLoadSuccess && onTweetLoadSuccess(twitterWidgetElement)
          })
          .catch(onTweetLoadError)
      })
    }

    const twttr = window['twttr']
    if (!(twttr && twttr.ready)) {
      const isLocal = window.location.protocol.indexOf('file') >= 0
      const protocol = isLocal ? this.props.protocol : ''

      addScript(`${protocol}//platform.twitter.com/widgets.js`, renderTweet)
    } else {
      renderTweet()
    }
  }

  componentDidMount() {
    this.loadTweetForProps(this.props)
  }

  shouldComponentUpdate(nextProps: ITweetEmbedProps, nextState: ITweetEmbedState) {
    return this.props.tweetId !== nextProps.tweetId || this.props.className !== nextProps.className
  }

  componentDidUpdate(nextProps, nextState) {
    if (this.props.tweetId !== nextProps.tweetId) {
      this.loadTweetForProps(nextProps)
    }
  }

  render() {
    const { props, state } = this
    const {
      tweetId,
      onTweetLoadError,
      onTweetLoadSuccess,
      options,
      children,
      protocol,
      ...restProps
    } = props
    return (
      <div
        {...restProps}
        ref={(c) => {
          this._div = c
        }}
      >
        {state.isLoading && props.children}
      </div>
    )
  }
}

export default Tweet
