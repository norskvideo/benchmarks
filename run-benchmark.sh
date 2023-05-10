#!/usr/bin/env bash
set -euo pipefail
cd "${0%/*}"

declare LOG_ROOT
declare LICENSE_FILE
declare SOURCE
declare NORSK_IMAGE
declare BENCHMARK_COMMAND

export NORSK_IMAGE=id3asnorsk/norsk:v0.0.322-main

function usage() {
    echo "Usage: run-benchmark --license-file <license-file> --source <source> [options] [cmd]"
    echo "  Options:"
    echo "    --log-root <log-dir> : where on the host to mount Norsk's logs.  The actual logs will be in a subdirectory with the name of the example you are running.  Default ./norskLogs"
    echo "    --source <source> : a file relative to this script's directory to fire over RTMP at the benchmark"
    echo "  Commands:"
    echo "    start <benchmark-name> : start the specified benchmark."
    echo "    stop : Stops the last launched example with \`docker compose down\`"
    exit 1
}

function dockerComposeCmd() {
    if ! docker compose >/dev/null 2>&1; then
        if ! docker-compose >/dev/null 2>&1; then
            echo >&2 "Error: Unable to find docker-compose - exiting"
            exit 1
        else
            echo "docker-compose"
        fi
    else
        echo "docker compose"
    fi
}

function startBenchmark() {
    local -r dockerComposeCmd=$(dockerComposeCmd || exit 1)
    export BENCHMARK_COMMAND=$@

    mkdir -p "$LOG_ROOT"

    $dockerComposeCmd up --build --detach

    sleep 1
    echo "Benchmark app logs"
    docker logs norsk-benchmark-app
    exit 0
}

function stopBenchmark() {
    local -r dockerComposeCmd=$(dockerComposeCmd || exit 1)
    $dockerComposeCmd down -t 1
    exit 0
}

function main() {
    local -r opts=$(getopt -o h: --longoptions help,license-file:,source:,log-root: -n "$0" -- "$@")
    local dockerComposeCmd

    # Defaults
    LOG_ROOT="norskLogs"

    eval set -- "$opts"
    while true; do
        case "$1" in
        -h | --help)
            usage
            ;;
        --license-file)
            export LICENSE_FILE="$2"
            shift 2
            ;;
        --source)
            export SOURCE="$2"
            shift 2
            ;;
        --log-root)
            # Remove trailing slash if present
            export LOG_ROOT=${2%/}
            shift 2
            ;;
        --)
            shift
            break
            ;;
        *)
            break
            ;;
        esac
    done
    if [[ $# -eq 1 ]]; then
        case "$1" in
        stop)
            stopBenchmark
            exit 0
            ;;
        *)
            echo "Error: Unknown command $1"
            usage
            ;;
        esac
    fi

    if [[ -z ${LICENSE_FILE+x} ]]; then
        usage
    fi
    if [[ ! -f ${LICENSE_FILE} ]]; then
        echo "License file not found: ${LICENSE_FILE}"
        exit 1
    fi

    if [[ $# -ge 2 ]]; then
        case "$1" in
        start)
            shift
            startBenchmark "$@"
            ;;
        *)
            echo "Error: Unknown command $1"
            usage
            ;;
        esac
    fi
}

main "$@"

