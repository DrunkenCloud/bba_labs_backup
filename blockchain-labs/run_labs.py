#!/usr/bin/env python3
import os
import sys
import subprocess
import glob
import signal
import psutil
from pathlib import Path

class BlockchainLabsRunner:
    def __init__(self):
        self.current_dir = Path.cwd()
        self.running_processes = []

    def print_separator(self):
        print("=" * 80)

    def print_header(self, title):
        print()
        self.print_separator()
        print(f"   {title}")
        self.print_separator()

    def print_subsection(self, title):
        print()
        print("-" * 80)
        print(f"   {title}")
        print("-" * 80)

    def list_labs(self):
        self.print_header("BLOCKCHAIN LABS - AVAILABLE OPTIONS")
        print()
        print("Python Files:")
        print("-" * 80)
        
        # List Python files
        py_files = glob.glob("*.py")
        if py_files:
            for py_file in sorted(py_files):
                name = Path(py_file).stem
                print(f"   - {name}")
        else:
            print("   No Python files found in current directory")

        print()
        print("Lab Directories:")
        print("-" * 80)
        
        # List lab directories
        lab_dirs = glob.glob("lab*")
        lab_dirs = [d for d in lab_dirs if Path(d).is_dir()]
        if lab_dirs:
            for lab_dir in sorted(lab_dirs):
                print(f"   - {lab_dir}")
        else:
            print("   No lab directories found")

        self.print_separator()
        print(f"Current directory: {self.current_dir}")
        print()

    def run_python_lab(self, lab_name):
        self.print_subsection(f"RUNNING PYTHON LAB: {lab_name}")
        py_file = f"{lab_name}.py"
        print(f"Executing: python {py_file}")
        print()
        
        try:
            result = subprocess.run([sys.executable, py_file], 
                                  cwd=self.current_dir, 
                                  check=False)
            return result.returncode == 0
        except Exception as e:
            print(f"Error running {py_file}: {e}")
            return False

    def run_lab_directory(self, lab_dir):
        self.print_subsection(f"RUNNING LAB DIRECTORY: {lab_dir}")
        lab_path = self.current_dir / lab_dir
        
        if not lab_path.exists():
            print(f"Directory {lab_dir} not found")
            return False

        processes_started = []

        # Check if it's a React app
        frontend_package = lab_path / "frontend" / "package.json"
        if frontend_package.exists():
            print("Starting React frontend...")
            try:
                process = subprocess.Popen(
                    ["npm", "start"],
                    cwd=lab_path / "frontend",
                    shell=True
                )
                self.running_processes.append(process)
                processes_started.append(("React frontend", process))
                print("React frontend started")
            except Exception as e:
                print(f"Error starting React frontend: {e}")

        # Check if it's a Python web server
        app_py = lab_path / "app.py"
        if app_py.exists():
            print("Starting Python web server...")
            try:
                process = subprocess.Popen(
                    [sys.executable, "app.py"],
                    cwd=lab_path
                )
                self.running_processes.append(process)
                processes_started.append(("Python web server", process))
                print("Python web server started")
            except Exception as e:
                print(f"Error starting Python web server: {e}")

        # If we started any processes, wait for them
        if processes_started:
            print()
            print("Lab processes are running. Press Ctrl+C to stop and return to menu.")
            print("=" * 60)
            try:
                # Wait for any process to finish
                while True:
                    for name, process in processes_started:
                        if process.poll() is not None:
                            print(f"\n{name} has stopped.")
                            return True
                    
                    # Small delay to avoid busy waiting
                    import time
                    time.sleep(1)
                    
            except KeyboardInterrupt:
                print(f"\nStopping {len(processes_started)} lab process(es)...")
                for name, process in processes_started:
                    try:
                        process.terminate()
                        process.wait(timeout=3)
                        print(f"{name} stopped")
                    except:
                        try:
                            process.kill()
                            print(f"{name} force killed")
                        except:
                            pass
                return True
        else:
            print("No lab processes found to run in this directory")

        return True

    def run_lab24_27(self, lab_number):
        self.print_subsection(f"RUNNING LAB24_27: {lab_number}")
        lab_path = self.current_dir / "lab24_27"
        
        if not lab_path.exists():
            print("lab24_27 directory not found")
            return False

        # Check if build/contracts folder exists, if not run truffle commands
        contracts_path = lab_path / "build" / "contracts"
        if not contracts_path.exists():
            print("Compiling and migrating contracts...")
            print("-" * 80)
            
            try:
                subprocess.run(["truffle", "compile"], cwd=lab_path, check=True)
                print("-" * 80)
                subprocess.run(["truffle", "migrate"], cwd=lab_path, check=True)
                print("-" * 80)
            except subprocess.CalledProcessError as e:
                print(f"Error running truffle commands: {e}")
                return False
            except FileNotFoundError:
                print("Truffle not found. Please install truffle first.")
                return False

        # Run the specific Python file
        py_file = lab_path / f"{lab_number}.py"
        if py_file.exists():
            print(f"Running lab {lab_number}...")
            print("-" * 80)
            try:
                result = subprocess.run([sys.executable, f"{lab_number}.py"], 
                                      cwd=lab_path, 
                                      check=False)
                return result.returncode == 0
            except Exception as e:
                print(f"Error running lab {lab_number}: {e}")
                return False
        else:
            print(f"Lab {lab_number}.py not found in lab24_27 directory")
            return False

    def run_lab28(self):
        self.print_subsection("RUNNING LAB28")
        lab_path = self.current_dir / "lab28"
        
        if not lab_path.exists():
            print("lab28 directory not found")
            return False

        # Check if build/contracts folder exists, if not run truffle commands
        contracts_path = lab_path / "build" / "contracts"
        if not contracts_path.exists():
            print("Compiling and migrating contracts...")
            print("-" * 80)
            
            try:
                subprocess.run(["truffle", "compile"], cwd=lab_path, check=True)
                print("-" * 80)
                subprocess.run(["truffle", "migrate"], cwd=lab_path, check=True)
                print("-" * 80)
            except subprocess.CalledProcessError as e:
                print(f"Error running truffle commands: {e}")
                return False
            except FileNotFoundError:
                print("Truffle not found. Please install truffle first.")
                return False

        # Run the Flask app and wait for it
        print("Starting lab28 Flask app...")
        print("-" * 80)
        print("Flask app is running. Press Ctrl+C to stop and return to menu.")
        print("=" * 60)
        
        try:
            # Run the Flask app in foreground (wait for it)
            result = subprocess.run([sys.executable, "app.py"], 
                                  cwd=lab_path, 
                                  check=False)
            return result.returncode == 0
        except KeyboardInterrupt:
            print("\nFlask app stopped by user")
            return True
        except Exception as e:
            print(f"Error running lab28: {e}")
            return False

    def stop_labs(self):
        self.print_subsection("STOPPING ALL LAB PROCESSES")
        print("Stopping all lab processes...")
        
        # Stop processes we started
        stopped_count = 0
        for process in self.running_processes:
            try:
                if process.poll() is None:  # Process is still running
                    process.terminate()
                    try:
                        process.wait(timeout=3)
                        stopped_count += 1
                    except subprocess.TimeoutExpired:
                        process.kill()
                        process.wait(timeout=1)
                        stopped_count += 1
            except Exception as e:
                print(f"Error stopping process: {e}")
        
        # Only kill specific lab processes, NOT all python processes
        current_pid = os.getpid()
        lab_processes_killed = 0
        
        try:
            for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
                try:
                    # Skip our own process
                    if proc.info['pid'] == current_pid:
                        continue
                    
                    # Only target specific lab-related processes
                    if proc.info['name'] in ['node.exe', 'node']:
                        proc.terminate()
                        lab_processes_killed += 1
                    elif proc.info['name'] in ['python.exe', 'python']:
                        # Only kill Python processes that look like lab processes
                        cmdline = proc.info.get('cmdline', [])
                        if cmdline and len(cmdline) > 1:
                            script_name = cmdline[1].lower()
                            # Kill if it's a lab script or app.py, but NOT our runner
                            if ('lab' in script_name or 
                                'app.py' in script_name or 
                                'server.py' in script_name) and 'lab_runner.py' not in script_name:
                                proc.terminate()
                                lab_processes_killed += 1
                                
                except (psutil.NoSuchProcess, psutil.AccessDenied, IndexError):
                    pass
        except Exception as e:
            print(f"Warning: Error during process cleanup: {e}")
        
        self.running_processes.clear()
        print(f"Stopped {stopped_count} tracked processes and {lab_processes_killed} lab processes")

    def main_loop(self):
        print("Blockchain Labs Runner for Python")
        print()
        
        # Show labs list once at the beginning
        self.list_labs()
        
        try:
            while True:
                self.print_subsection("LAB SELECTION")
                print("Enter lab number to run, 'l' to list labs, or 'q' to quit:")
                print("-" * 80)
                choice = input("> ").strip()
                
                if choice.lower() == 'q':
                    self.print_subsection("EXITING")
                    self.stop_labs()
                    print("Goodbye!")
                    self.print_separator()
                    break
                elif choice.lower() == 'l':
                    self.list_labs()
                    continue
                
                # Stop any running labs
                self.stop_labs()
                
                # Check if it's a Python file
                if Path(f"{choice}.py").exists():
                    self.run_python_lab(choice)
                elif choice.isdigit() and 24 <= int(choice) <= 27:
                    # Check if it's lab24_27 (labs 24-27)
                    self.run_lab24_27(choice)
                elif choice == "28":
                    # Run lab28 with Truffle setup
                    self.run_lab28()
                elif Path(f"lab{choice}").exists():
                    # Check if it's a lab directory (but not lab28, which needs special handling)
                    if choice == "28":
                        self.run_lab28()
                    else:
                        self.run_lab_directory(f"lab{choice}")
                else:
                    self.print_subsection("ERROR")
                    print("Invalid lab number. Please try again.")
                
                self.print_subsection("CONTINUE")
                print("Press Enter to continue to main menu...")
                print("-" * 80)
                input()
                
        except KeyboardInterrupt:
            print("\n\nInterrupted by user")
            self.stop_labs()
        except Exception as e:
            print(f"An error occurred: {e}")
            self.stop_labs()

def main():
    runner = BlockchainLabsRunner()
    runner.main_loop()

if __name__ == "__main__":
    main()