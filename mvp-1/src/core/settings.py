import os, yaml

# Load YAML from config/
def load_yaml(path):
    with open(path, "r") as f:
        return yaml.safe_load(f)

CHROMA_CFG = load_yaml("config/chroma_config.yaml")
GEMINI_CFG = load_yaml("config/gemini_config.yaml")

# Allow override via ENV
GEMINI_CFG["gemini_api_key"] = os.getenv("GEMINI_API_KEY", GEMINI_CFG["gemini_api_key"])
