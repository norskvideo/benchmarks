#!/usr/bin/env bash
set -euo pipefail
cd "${0%/*}"

declare LOG_ROOT
declare LICENSE_FILE
declare SOURCE
declare NORSK_IMAGE
declare BENCHMARK_COMMAND
declare COUNT

export NORSK_IMAGE=norskvideo/norsk:v0.0.329-main

function usage() {
    echo "Usage: run-benchmark --license-file <license-file> --source <source> [options] [cmd]"
    echo "  Options:"
    echo "    --log-root <log-dir> : where on the host to mount Norsk's logs.  The actual logs will be in a subdirectory with the name of the example you are running.  Default ./norskLogs"
    echo "    --count <count> : How many to spin up simultaneously, Default: 1"
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
            echo >&2 "Error: Docker compose v1 found, please upgrade to v2"
            exit 1 
        fi
    else
        echo "docker compose"
    fi
}

function startBenchmark() {
    local -r dockerComposeCmd=$(dockerComposeCmd || exit 1)

    if [[ -z $dockerComposeCmd ]]; then
      exit 1
    fi
    export BENCHMARK_COMMAND="$@"

    mkdir -p "$LOG_ROOT"

    runTemplate
    $dockerComposeCmd up --build --detach --remove-orphans

    sleep 1
    exit 0
}

function stopBenchmark() {
    local -r dockerComposeCmd=$(dockerComposeCmd || exit 1)
    $dockerComposeCmd down -t 1 --remove-orphans
    exit 0
}


function runTemplate() {
    rm -f docker-compose.yml
    cat template/root.yml > docker-compose.yml

    for i in $(seq 1 $COUNT); do
      cat template/compose.yml |
      sed -e 's#${INDEX}#'"$i"'#g' \
          -e 's#${LICENSE_FILE}#'"$(realpath "$LICENSE_FILE")"'#g' \
          -e 's#${LOG_ROOT}#'"$(realpath "$LOG_ROOT")"'#g' \
          -e 's#${NORSK_HOST}#'"norsk-server-$i"'#g' \
          -e 's#${BENCHMARK_COMMAND}#'"$BENCHMARK_COMMAND"'#g' \
          -e 's#${SOURCE}#'"$SOURCE"'#g' \
          >> docker-compose.yml
    done
}

function main() {
    local -r opts=$(getopt -o h: --longoptions help,license-file:,source:,count:,log-root: -n "$0" -- "$@")
    local dockerComposeCmd

    # Defaults
    LOG_ROOT="norskLogs"
    COUNT=0

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
        --count)
            export COUNT="$2"
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

