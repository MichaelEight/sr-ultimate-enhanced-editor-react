import os

# Define the projectFileStructure
projectFileStructure = {
    "backend": {
        "__init__.py": "",
        "app.py": "",
        "config.py": "",
        "requirements.txt": "",
        "routes": {
            "__init__.py": "",
            "scenario.py": "",
            "region.py": "",
            "resource.py": "",
            "theater.py": "",
        },
        "services": {
            "__init__.py": "",
            "scenario_service.py": "",
            "region_service.py": "",
            "resource_service.py": "",
            "theater_service.py": "",
        },
        "models": {
            "__init__.py": "",
            "scenario.py": "",
            "region.py": "",
            "resource.py": "",
            "theater.py": "",
        },
        "utils": {
            "__init__.py": "",
            "helpers.py": "",
            "validators.py": "",
        },
        "tests": {
            "__init__.py": "",
            "test_scenario.py": "",
            "test_region.py": "",
            "test_resource.py": "",
            "test_theater.py": "",
        },
    },
    "frontend": {
        "public": {
            "index.html": "",
            "manifest.json": "",
        },
        "src": {
            "assets": {
                "images": {},
                "styles": {
                    "main.css": "",
                },
            },
            "components": {
                "common": {
                    "Button.jsx": "",
                    "Input.jsx": "",
                    "Modal.jsx": "",
                },
                "Scenario": {
                    "ScenarioList.jsx": "",
                    "ScenarioEditor.jsx": "",
                },
                "Region": {
                    "RegionList.jsx": "",
                    "RegionEditor.jsx": "",
                },
                "Resource": {
                    "ResourceList.jsx": "",
                    "ResourceEditor.jsx": "",
                },
                "Theater": {
                    "TheaterList.jsx": "",
                    "TheaterEditor.jsx": "",
                },
            },
            "contexts": {
                "AppContext.js": "",
            },
            "hooks": {
                "useFetch.js": "",
                "useAuth.js": "",
            },
            "pages": {
                "Home.jsx": "",
                "ScenarioPage.jsx": "",
                "RegionPage.jsx": "",
                "ResourcePage.jsx": "",
                "TheaterPage.jsx": "",
            },
            "services": {
                "api.js": "",
                "scenarioService.js": "",
                "regionService.js": "",
                "resourceService.js": "",
                "theaterService.js": "",
            },
            "App.jsx": "",
            "index.js": "",
        },
        ".gitignore": "",
        "package.json": "",
        "README.md": "",
    },
    ".gitignore": "",
    "docker-compose.yml": "",
    "Dockerfile": "",
    "README.md": "",
    "package.json": "",
}

# Function to create the projectFileStructure
def create_structure(base_path, projectFileStructure):
    for name, content in projectFileStructure.items():
        path = os.path.join(base_path, name)
        if isinstance(content, dict):
            if not os.path.exists(path):
                os.makedirs(path)
            create_structure(path, content)
        else:
            if not os.path.exists(path):
                with open(path, 'w') as f:
                    f.write(content)

# Create the projectFileStructure in the current directory
create_structure(os.getcwd(), projectFileStructure)
