# Norsk Benchmarking

This is a repository that aims to make it 'easy' to run some of the more common tasks in Norsk with custom supplied config in order to see what sort of load can be achieved on chosen hardware.

There are presently three benchmarks to choose from

- SRT -> HLS Ladder
- SRT -> Compose -> HLS Ladder
- RTP Audio Mixer -> HLS Ladder

The latter tends to cap out on network requirements long before any machine reaches saturation so we'll focus on the video ladders in these examples.

Preparing to run SRT -> HLS Ladder
------

- Ensure Docker and Docker Compose (at least v2) is installed
- Ensure a valid license file is present somewhere locally
- Move a representative source into ./sources (relative to the run-benchmark.sh script)

Test that this setup is correct by running a single instance of the benchmark with the default ladder

```
export MY_SOURCE=sources/my_source.ts
export MY_LICENSE_FILE=/path/to/norsk_file.json

./run-benchmark.sh --license-file $MY_LICENSE_FILE --count 1 --source sources/$MY_SOURCE start 'npx benchmarks transcode'
```


All going well, this will create a docker compose setup with three containers

- norsk-source-1: An ffmpeg sending the source to norsk
- norsk-benchmark-app-1: The NodeJS app instructing Norsk what to do
- norsk-server-1: The Norsk instance being measured 

We can stop the benchmark by running the same command but with 'stop'

```
./run-benchmark.sh --license-file $MY_LICENSE_FILE --count 2 --source sources/$MY_SOURCE stop
```


The default ladder is (deliberately) lightweight so we can easily change the above script to run two instances side by side

```
./run-benchmark.sh --license-file $MY_LICENSE_FILE --count 2 --source sources/$MY_SOURCE start 'npx benchmarks transcode'
```

Changing the ladder
------

Another ladder exists out of the box in the benchmark app, and using it is as simple as specifying its name

```
./run-benchmark.sh --license-file $MY_LICENSE_FILE --count 2 --source sources/$MY_SOURCE start 'npx benchmarks transcode --ladder high-ultrafast'
```

By adding typescript files to the folder *app/src/ladders*, you can add your own more representative ladders for benchmarking purposes by specifying their name.


Using an Nvidia GPU
-------

The benchmarks can work against an nvidia GPU out of the box assuming that there is just one and that Nvidia has been set up correctly for using the GPU on docker according to Nvidia's own docs found [here](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html)

The Nvidia runtime should be the default on the machine, and this can be tested by running 

```
docker run --rm --gpus all nvidia/cuda:11.6.2-base-ubuntu20.04 nvidia-smi

+-----------------------------------------------------------------------------+
| NVIDIA-SMI 450.51.06    Driver Version: 450.51.06    CUDA Version: 11.0     |
|-------------------------------+----------------------+----------------------+
| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
|                               |                      |               MIG M. |
|===============================+======================+======================|
|   0  Tesla T4            On   | 00000000:00:1E.0 Off |                    0 |
| N/A   34C    P8     9W /  70W |      0MiB / 15109MiB |      0%      Default |
|                               |                      |                  N/A |
+-------------------------------+----------------------+----------------------+

+-----------------------------------------------------------------------------+
| Processes:                                                                  |
|  GPU   GI   CI        PID   Type   Process name                  GPU Memory |
|        ID   ID                                                   Usage      |
|=============================================================================|
|  No running processes found                                                 |
+-----------------------------------------------------------------------------+

```

If the runtime is setup but isn't the default, then the template for the benchmark (found in templates/compose.yml) can be edited to specify it.

With the above, we could run the default 'nvidia' ladder with this command easily.

```
./run-benchmark.sh --license-file $MY_LICENSE_FILE --count 1 --source sources/$MY_SOURCE start 'npx benchmarks transcode --ladder nvidia'
```


Note: Nvidia and X264 ladders can be mixed and matched (for example, using the Nvidia GPU for the HEVC 4k encodes and using X264 for mobile devices) and this is a key consideration when designing a ladder for benchmarking and production.

Further work
----

- Running ffmpeg locally (even with codec copying) consumes CPU and you might want to modify the benchmark app to consume an external source
- Running a Norsk instance per 'channel/event' is a common configuration for clients, but a multi-tenant solution would be more efficient (see the flag: '--load')
