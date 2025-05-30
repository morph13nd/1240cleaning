import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, Rectangle
import numpy as np

# Create figure and axis
fig, ax = plt.subplots(1, 1, figsize=(14, 10))
ax.set_xlim(0, 10)
ax.set_ylim(0, 12)
ax.axis('off')

# Define colors
primary_color = '#21808D'
secondary_color = '#5E5240'
accent_color = '#A84B2F'
success_color = '#33808D'
bg_color = '#FCFCF9'

# Title
ax.text(5, 11.5, 'Enhanced Chore Manager Statistics Feature Workflow', 
        fontsize=16, fontweight='bold', ha='center', color=primary_color)

# Process boxes
def create_process_box(x, y, width, height, text, color, text_color='white'):
    box = FancyBboxPatch((x-width/2, y-height/2), width, height,
                         boxstyle="round,pad=0.1", facecolor=color, 
                         edgecolor='black', linewidth=1)
    ax.add_patch(box)
    ax.text(x, y, text, ha='center', va='center', fontsize=9, 
            color=text_color, weight='bold', wrap=True)

# Decision diamonds
def create_decision_diamond(x, y, size, text, color):
    diamond = mpatches.RegularPolygon((x, y), 4, radius=size, 
                                     orientation=np.pi/4, facecolor=color,
                                     edgecolor='black', linewidth=1)
    ax.add_patch(diamond)
    ax.text(x, y, text, ha='center', va='center', fontsize=8, 
            color='white', weight='bold')

# Data storage rectangles
def create_data_box(x, y, width, height, text, color):
    box = Rectangle((x-width/2, y-height/2), width, height,
                   facecolor=color, edgecolor='black', linewidth=1)
    ax.add_patch(box)
    ax.text(x, y, text, ha='center', va='center', fontsize=8, 
            color='white', weight='bold')

# Arrows
def create_arrow(x1, y1, x2, y2, color='black'):
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle='->', lw=2, color=color))

# Main workflow
create_process_box(2, 10, 1.5, 0.8, 'User Opens\nStatistics Tab', primary_color)
create_arrow(2, 9.6, 2, 8.4)

create_process_box(2, 8, 1.5, 0.8, 'View Current\nDashboard', secondary_color)
create_arrow(2, 7.6, 2, 6.4)

create_process_box(2, 6, 1.5, 0.8, 'Click Generate\nStatistics Report', accent_color)
create_arrow(2.75, 6, 4.25, 6)

# Data collection branch
create_data_box(5, 6, 1.5, 0.8, 'IndexedDB\nData Collection', success_color)
create_arrow(5, 5.6, 5, 4.4)

create_process_box(5, 4, 1.5, 0.8, 'Calculate\nStatistics', primary_color)
create_arrow(5, 3.6, 5, 2.4)

create_process_box(5, 2, 1.5, 0.8, 'Generate JSON\nFile', secondary_color)
create_arrow(5.75, 2, 7.25, 2)

# File operations
create_process_box(8, 2, 1.5, 0.8, 'Download File\nto Device', accent_color)
create_arrow(8, 2.4, 8, 3.6)

create_decision_diamond(8, 4.5, 0.6, 'Manual\nUpload?', success_color)
create_arrow(8.6, 4.5, 9.5, 4.5)

# GitHub integration
create_process_box(9.5, 6, 1.2, 0.8, 'Upload to\nGitHub Repo', primary_color)
create_arrow(9.5, 5.6, 9.5, 4.9)

# File loading branch
create_arrow(7.4, 4.5, 6.6, 4.5)
create_process_box(6, 4.5, 1.2, 0.8, 'Load Statistics\nFile', secondary_color)
create_arrow(6, 5.3, 6, 6.7)

create_process_box(6, 7.5, 1.5, 0.8, 'Display in\nDashboard', accent_color)

# Data structure details
ax.text(1, 1.5, 'Statistics File Contents:', fontsize=11, fontweight='bold', color=primary_color)
ax.text(0.2, 1, '• Metadata (timestamp, version)', fontsize=9, color=secondary_color)
ax.text(0.2, 0.7, '• Overall completion rates', fontsize=9, color=secondary_color)
ax.text(0.2, 0.4, '• Individual performance scores', fontsize=9, color=secondary_color)
ax.text(0.2, 0.1, '• Violation tracking & trends', fontsize=9, color=secondary_color)

# GitHub integration details
ax.text(7, 1.5, 'GitHub Integration:', fontsize=11, fontweight='bold', color=primary_color)
ax.text(6.2, 1, '• Manual file upload', fontsize=9, color=secondary_color)
ax.text(6.2, 0.7, '• API endpoint examples', fontsize=9, color=secondary_color)
ax.text(6.2, 0.4, '• Commit message templates', fontsize=9, color=secondary_color)
ax.text(6.2, 0.1, '• Version control tracking', fontsize=9, color=secondary_color)

# Legend
legend_elements = [
    mpatches.Patch(color=primary_color, label='Core Process'),
    mpatches.Patch(color=secondary_color, label='Data Operation'),
    mpatches.Patch(color=accent_color, label='User Action'),
    mpatches.Patch(color=success_color, label='Decision/Storage')
]
ax.legend(handles=legend_elements, loc='upper right', bbox_to_anchor=(0.98, 0.98))

plt.tight_layout()
plt.savefig('statistics_workflow.png', dpi=300, bbox_inches='tight', 
            facecolor=bg_color, edgecolor='none')
plt.show()