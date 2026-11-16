"""Freebie Binder architecture: a static PNG and a GIF that walks through the upload flow.

Usage:
    $ uv run --with diagrams python docs/diagram.py
Writes docs/architecture.png and docs/architecture.gif (needs graphviz and ffmpeg).
"""
import subprocess
import tempfile
from pathlib import Path

from diagrams import Cluster, Diagram, Edge, Node
from diagrams.aws.compute import Lambda
from diagrams.aws.database import Dynamodb
from diagrams.aws.ml import Rekognition
from diagrams.aws.network import CloudFront
from diagrams.aws.storage import SimpleStorageServiceS3Bucket as Bucket
from diagrams.generic.device import Mobile

HERE = Path(__file__).parent

ACTIVE = "#e8457a"  # arrow color for the current step
IDLE = "#c9c9c9"

# The number goes on the arrow, the text in the frame title
STEPS = {
    1: "1. The app asks to upload and reserves an id in DynamoDB",
    2: "2. The phone uploads the photo straight to the private bucket",
    3: "3. On publish, the server reads the photo and checks it is a JPEG",
    4: "4. Rekognition checks the photo and the text written on it",
    5: "5. If it passes, the server copies it to the public bucket and saves the freebie",
    6: "6. Other fans see the photo from the public bucket",
}


def edge(step: int, current: int | None, **kw) -> Edge:
    on = current is None or current == step
    return Edge(
        label=str(step),
        color=ACTIVE if on and current is not None else ("#555555" if on else IDLE),
        fontcolor=ACTIVE if on and current is not None else ("#555555" if on else IDLE),
        penwidth="2.5",
        **kw,
    )


def build(filename: Path, current: int | None) -> None:
    title = STEPS[current] if current else "Freebie Binder: photo moderation"
    graph_attr = {"fontsize": "22", "pad": "0.5", "bgcolor": "white", "labelloc": "t",
                  "splines": "spline", "nodesep": "0.9", "ranksep": "1.3"}
    with Diagram(title, filename=str(filename), show=False, outformat="png",
                 direction="LR", graph_attr=graph_attr):
        phone = Mobile("Phone")
        clerk = Node("Clerk\n(login)", shape="box", style="rounded", height="0.8", width="1.4",
                     fontsize="13", labelloc="c")
        with Cluster("AWS (us-west-2)"):
            with Cluster("Next.js app (SST + OpenNext)"):
                cdn = CloudFront("CloudFront")
                assets = Bucket("Assets\n(JS, CSS, icons)")
                web = Lambda("Next.js server\n(server actions)")
            table = Dynamodb("DynamoDB")
            rekognition = Rekognition("Rekognition")
            with Cluster("Private: nobody reads"):
                uploads = Bucket("Uploads")
            with Cluster("Public: only the server writes"):
                images = Bucket("Images")

        cdn >> Edge(style="dashed", color="#888888", label="static", fontcolor="#888888") >> assets
        phone >> Edge(style="dashed", color=IDLE, constraint="false") >> clerk
        phone >> edge(1, current) >> cdn >> edge(1, current) >> web
        web >> edge(1, current) >> table
        phone >> edge(2, current) >> uploads
        uploads >> edge(3, current) >> web
        web >> edge(4, current) >> rekognition
        web >> edge(5, current) >> images
        web >> edge(5, current) >> table
        fans = Mobile("Other fans")
        images >> edge(6, current) >> fans


def main() -> None:
    build(HERE / "architecture", None)

    with tempfile.TemporaryDirectory() as tmp:
        frames = Path(tmp)
        for i, step in enumerate(STEPS):
            build(frames / f"frame{i:02d}", step)

        # One frame every 2.2 s; a shared palette avoids the usual GIF color noise
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-framerate", "1/2.2", "-i", str(frames / "frame%02d.png"),
             "-vf", "scale=1400:-2:flags=lanczos,split[a][b];[a]palettegen=stats_mode=full[p];[b][p]paletteuse",
             "-loop", "0", str(HERE / "architecture.gif")],
            check=True,
        )


if __name__ == "__main__":
    main()
