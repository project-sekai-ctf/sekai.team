import { Tweet as ReactTweet } from 'react-tweet'

const Tweet = ({ id }) => {
  return (
    <div className="not-prose">
      <ReactTweet id={id} />
    </div>
  )
}

export default Tweet
