## `ingest` API Reference

### `/bootstrap`

Returns the following JSON object

```json
{
	"csrf_token": "<csrf token>",
	"services": [
		{
			"name": "service",
			"start_time": "<earliest timestamp the system has available in its circular buffer>",
			"end_time": "<most recent timestamp the system has in its circular buffer (reference only)>",
		}
	]
}
```

### `/:service/preview?start_time=int&end_time=int`

Generates a HLS/m3u8 preview file that allows the user to watch this portion of video with an appropriate player.

The HLS file names correspond to the timestamp at which they start. 


