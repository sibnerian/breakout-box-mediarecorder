# breakout-box-mediarecorder

https://sibnerian.github.io/breakout-box-mediarecorder/

Quick demo of breakout box / mediarecorder interaction.

The timestamp of the VideoFrame is preserved through the transform.

Therefore adding a delay in the worker, between creating and enqueuing a transformed frame, should not introduce delay.

However, we observe it does.
